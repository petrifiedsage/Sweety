const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns today's date string in YYYY-MM-DD using local calendar convention.
 */
function getTodayDateString(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates a YYYY-MM-DD string and checks that it represents a real calendar date.
 */
function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string' || !DATE_REGEX.test(dateStr.trim())) {
    return false;
  }
  const [year, month, day] = dateStr.trim().split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

/**
 * Converts a validated YYYY-MM-DD string to a UTC midnight Date object for PostgreSQL DATE column.
 */
function toUtcDate(dateStr) {
  const [year, month, day] = dateStr.trim().split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object (from Prisma @db.Date) to YYYY-MM-DD string.
 */
function formatDateString(dateObj) {
  if (!dateObj) return null;
  if (typeof dateObj === 'string' && DATE_REGEX.test(dateObj)) {
    return dateObj;
  }
  const d = new Date(dateObj);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes the first day of the month (YYYY-MM-01) for a given YYYY-MM-DD string.
 */
function getFirstDayOfMonth(dateStr) {
  const [year, month] = dateStr.trim().split('-');
  return `${year}-${month}-01`;
}

/**
 * Computes the full previous calendar month range { from: YYYY-MM-DD, to: YYYY-MM-DD }
 * relative to a given YYYY-MM-DD string.
 */
function getPreviousMonthRange(dateStr) {
  const [year, month] = dateStr.trim().split('-').map(Number);
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;

  // Day 0 of current month in UTC gives the last day of the previous month
  const lastDayOfPrevMonth = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();

  const mm = String(prevMonth).padStart(2, '0');
  const dd = String(lastDayOfPrevMonth).padStart(2, '0');

  return {
    from: `${prevYear}-${mm}-01`,
    to: `${prevYear}-${mm}-${dd}`,
  };
}

module.exports = {
  getTodayDateString,
  isValidDateString,
  toUtcDate,
  formatDateString,
  getFirstDayOfMonth,
  getPreviousMonthRange,
};
