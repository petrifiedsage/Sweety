const prisma = require('../config/db');
const { TIME_SLOT_LIST } = require('../utils/timeSlots');
const { getTodayDateString, toUtcDate, isValidDateString } = require('../utils/dateUtils');
const cacheService = require('../services/cacheService');

async function evaluateUserDailyReminder(userId, dateQuery = null) {
  const targetDate =
    dateQuery && isValidDateString(dateQuery) ? dateQuery.trim() : getTodayDateString();

  const readings = await prisma.reading.findMany({
    where: {
      user_id: userId,
      reading_date: toUtcDate(targetDate),
    },
  });

  const loggedSlotCodes = new Set(readings.map((r) => r.time_slot));

  const loggedSlots = TIME_SLOT_LIST.filter((s) => loggedSlotCodes.has(s.code)).map(
    (s) => ({
      code: s.code,
      label: s.label,
    })
  );

  const missingSlots = TIME_SLOT_LIST.filter((s) => !loggedSlotCodes.has(s.code)).map(
    (s) => ({
      code: s.code,
      label: s.label,
    })
  );

  const isComplete = missingSlots.length === 0;
  const message = isComplete
    ? 'All 4 daily blood glucose readings have been logged for today.'
    : `You have ${missingSlots.length} unlogged time slot${
        missingSlots.length === 1 ? '' : 's'
      } for ${targetDate}: ${missingSlots.map((s) => s.label).join(', ')}.`;

  const payload = {
    user_id: userId,
    date: targetDate,
    logged_count: loggedSlots.length,
    missing_count: missingSlots.length,
    is_complete: isComplete,
    logged_slots: loggedSlots,
    missing_slots: missingSlots,
    message,
    evaluated_at: new Date().toISOString(),
  };

  await cacheService.setKey(`reminders:${userId}:${targetDate}`, payload, 3600);
  return payload;
}

module.exports = {
  evaluateUserDailyReminder,
};
