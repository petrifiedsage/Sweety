const { evaluateUserDailyReminder } = require('../jobs/reminderJob');
const { enqueueDailyReminderCheck } = require('../jobs/jobQueue');

async function getDailyReminderStatus(req, res, next) {
  try {
    const reminder = await evaluateUserDailyReminder(req.user.id, req.query.date);
    return res.status(200).json({ reminder });
  } catch (err) {
    return next(err);
  }
}

async function triggerDailyReminderJob(req, res, next) {
  try {
    const date = req.body?.date || req.query?.date || null;
    const result = await enqueueDailyReminderCheck(req.user.id, date);
    return res.status(200).json({
      message: 'Daily reminder check processed.',
      ...result,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDailyReminderStatus,
  triggerDailyReminderJob,
};
