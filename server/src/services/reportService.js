const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const {
  getTodayDateString,
  isValidDateString,
  toUtcDate,
  getFirstDayOfMonth,
  getPreviousMonthRange,
} = require('../utils/dateUtils');
const { formatReading } = require('./readingService');

function resolveSelectedDate(dateParam) {
  if (!dateParam) {
    return getTodayDateString();
  }
  if (typeof dateParam !== 'string' || !isValidDateString(dateParam)) {
    throw new AppError('Invalid date parameter. Expected YYYY-MM-DD format.', 400);
  }
  return dateParam.trim();
}

function calculateStatistics(readings) {
  const total_readings = readings.length;

  if (total_readings === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      total_readings: 0,
    };
  }

  let highest = readings[0].glucose_value;
  let lowest = readings[0].glucose_value;
  let sum = 0;

  for (const r of readings) {
    const val = r.glucose_value;
    if (val > highest) highest = val;
    if (val < lowest) lowest = val;
    sum += val;
  }

  const average = Math.round((sum / total_readings) * 10) / 10;

  return {
    highest,
    lowest,
    average,
    total_readings,
  };
}

async function fetchReadingsInRange(userId, fromStr, toStr, sortAscending = true) {
  const records = await prisma.reading.findMany({
    where: {
      user_id: userId,
      reading_date: {
        gte: toUtcDate(fromStr),
        lte: toUtcDate(toStr),
      },
    },
    orderBy: [{ reading_date: sortAscending ? 'asc' : 'desc' }, { created_at: 'asc' }],
  });

  return records.map(formatReading).sort((a, b) => {
    if (a.reading_date !== b.reading_date) {
      return sortAscending
        ? a.reading_date < b.reading_date
          ? -1
          : 1
        : a.reading_date < b.reading_date
        ? 1
        : -1;
    }
    return a.slot_order - b.slot_order;
  });
}

async function getDailyReport(userId, dateQuery) {
  const selectedDate = resolveSelectedDate(dateQuery);
  const readings = await fetchReadingsInRange(userId, selectedDate, selectedDate, true);
  const statistics = calculateStatistics(readings);

  return {
    report_type: 'DAILY',
    selected_date: selectedDate,
    date_range: {
      from: selectedDate,
      to: selectedDate,
    },
    statistics,
    readings,
  };
}

async function getMonthToDateReport(userId, dateQuery) {
  const selectedDate = resolveSelectedDate(dateQuery);
  const fromDate = getFirstDayOfMonth(selectedDate);
  const readings = await fetchReadingsInRange(userId, fromDate, selectedDate, true);
  const statistics = calculateStatistics(readings);

  return {
    report_type: 'MONTH_TO_DATE',
    selected_date: selectedDate,
    date_range: {
      from: fromDate,
      to: selectedDate,
    },
    statistics,
    readings,
  };
}

async function getPreviousMonthlyReport(userId, dateQuery) {
  const selectedDate = resolveSelectedDate(dateQuery);
  const { from, to } = getPreviousMonthRange(selectedDate);
  const readings = await fetchReadingsInRange(userId, from, to, true);
  const statistics = calculateStatistics(readings);

  return {
    report_type: 'PREVIOUS_MONTH',
    selected_date: selectedDate,
    date_range: {
      from,
      to,
    },
    statistics,
    readings,
  };
}

module.exports = {
  calculateStatistics,
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthlyReport,
};
