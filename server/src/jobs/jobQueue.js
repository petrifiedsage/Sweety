const { Queue, Worker } = require('bullmq');
const env = require('../config/env');
const { isRedisConnected } = require('../config/redis');
const {
  evaluateUserDailyReminder,
  evaluateAllUsersDailyReminders,
} = require('./reminderJob');
const reportService = require('../services/reportService');

let reminderQueue = null;
let warmupQueue = null;
let reminderWorker = null;
let warmupWorker = null;

function getBullConnectionConfig() {
  try {
    const url = new URL(env.redisUrl);
    return {
      host: url.hostname || 'localhost',
      port: Number(url.port) || 6379,
      password: url.password || undefined,
      maxRetriesPerRequest: null,
    };
  } catch {
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
}

async function initializeBackgroundJobs() {
  if (!isRedisConnected() || env.nodeEnv === 'test') {
    return;
  }

  const connection = getBullConnectionConfig();

  reminderQueue = new Queue('reading-reminders', { connection });
  warmupQueue = new Queue('report-warmup', { connection });

  reminderWorker = new Worker(
    'reading-reminders',
    async (job) => {
      if (job.name === 'check-all-users-daily-reminders') {
        return evaluateAllUsersDailyReminders();
      }
      const { userId, date } = job.data || {};
      if (userId) {
        return evaluateUserDailyReminder(userId, date);
      }
      return { status: 'skipped' };
    },
    { connection }
  );

  warmupWorker = new Worker(
    'report-warmup',
    async (job) => {
      const { userId, date } = job.data || {};
      if (userId) {
        await Promise.all([
          reportService.getDailyReport(userId, date),
          reportService.getMonthToDateReport(userId, date),
        ]);
        return { warmed: true, userId, date };
      }
      return { warmed: false };
    },
    { connection }
  );

  // Schedule automated daily reminders at meal check-in hours (9 AM, 1 PM, 6 PM, 9 PM)
  await reminderQueue.upsertJobScheduler(
    'daily-meal-slot-reminders',
    { pattern: '0 9,13,18,21 * * *' },
    {
      name: 'check-all-users-daily-reminders',
      data: {},
    }
  );
}

async function enqueueDailyReminderCheck(userId, dateStr = null) {
  if (reminderQueue && isRedisConnected()) {
    const job = await reminderQueue.add(
      'check-user-daily-slots',
      { userId, date: dateStr },
      { removeOnComplete: 50, removeOnFail: 20 }
    );
    const reminder = await evaluateUserDailyReminder(userId, dateStr);
    return {
      queued: true,
      queue: 'reading-reminders',
      job_id: job.id,
      reminder,
    };
  }

  // Fallback direct execution when Redis is offline or in test mode
  const reminder = await evaluateUserDailyReminder(userId, dateStr);
  return {
    queued: false,
    queue: 'reading-reminders',
    job_id: `local-${Date.now()}`,
    reminder,
  };
}

async function enqueueReportWarmup(userId, dateStr = null) {
  if (warmupQueue && isRedisConnected()) {
    try {
      await warmupQueue.add(
        'warm-user-reports',
        { userId, date: dateStr },
        { removeOnComplete: 50, removeOnFail: 20 }
      );
      return { queued: true };
    } catch {
      return { queued: false };
    }
  }
  return { queued: false };
}

module.exports = {
  initializeBackgroundJobs,
  enqueueDailyReminderCheck,
  enqueueReportWarmup,
};
