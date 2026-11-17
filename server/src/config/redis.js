const Redis = require('ioredis');
const env = require('./env');

let redisClient = null;
let isRedisReady = false;

function getRedisClient() {
  if (env.nodeEnv === 'test') {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          // Stop retrying if Redis is not running locally; fallback cache will be used
          return null;
        }
        return Math.min(times * 250, 1000);
      },
    });

    redisClient.on('ready', () => {
      isRedisReady = true;
      console.log('Connected to Redis server for report caching and BullMQ jobs.');
    });

    redisClient.on('error', () => {
      isRedisReady = false;
    });

    redisClient.on('end', () => {
      isRedisReady = false;
    });

    redisClient.connect().catch(() => {
      isRedisReady = false;
    });
  } catch {
    redisClient = null;
    isRedisReady = false;
  }

  return redisClient;
}

function isRedisConnected() {
  return Boolean(redisClient && isRedisReady && redisClient.status === 'ready');
}

async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    }
    redisClient = null;
    isRedisReady = false;
  }
}

module.exports = {
  getRedisClient,
  isRedisConnected,
  closeRedis,
};
