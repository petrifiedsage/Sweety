const env = require('../config/env');
const { getRedisClient, isRedisConnected } = require('../config/redis');

// Fallback in-memory TTL store used when Redis is offline or during automated tests
const fallbackStore = new Map();

function buildReportCacheKey(userId, reportType, dateStr) {
  return `reports:${userId}:${reportType}:${dateStr}`;
}

async function getKey(key) {
  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      // fall through to fallback store
    }
  }

  const entry = fallbackStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    fallbackStore.delete(key);
    return null;
  }
  return entry.value;
}

async function setKey(key, value, ttlSeconds = env.reportCacheTtl) {
  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // fall through to fallback store
    }
  }

  fallbackStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function deleteByPrefix(prefix) {
  let deletedCount = 0;

  if (isRedisConnected()) {
    try {
      const client = getRedisClient();
      let cursor = '0';
      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');
    } catch {
      // fall through to fallback store
    }
  }

  for (const key of fallbackStore.keys()) {
    if (key.startsWith(prefix)) {
      fallbackStore.delete(key);
      deletedCount++;
    }
  }

  return deletedCount;
}

async function getCachedReport(userId, reportType, dateStr) {
  const key = buildReportCacheKey(userId, reportType, dateStr);
  return getKey(key);
}

async function setCachedReport(userId, reportType, dateStr, reportData, ttlSeconds) {
  const key = buildReportCacheKey(userId, reportType, dateStr);
  await setKey(key, reportData, ttlSeconds);
}

async function invalidateUserReports(userId) {
  const prefix = `reports:${userId}:`;
  return deleteByPrefix(prefix);
}

function clearAllCache() {
  fallbackStore.clear();
}

module.exports = {
  buildReportCacheKey,
  getKey,
  setKey,
  getCachedReport,
  setCachedReport,
  invalidateUserReports,
  clearAllCache,
};
