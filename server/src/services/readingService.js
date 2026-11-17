const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const cacheService = require('./cacheService');
const {
  getTimeSlotInfo,
  getDuplicateSlotMessage,
} = require('../utils/timeSlots');
const {
  toUtcDate,
  formatDateString,
  isValidDateString,
} = require('../utils/dateUtils');
const { validateReadingInput, validateUuid } = require('../validators/readingValidator');

function formatReading(record) {
  const slotInfo = getTimeSlotInfo(record.time_slot);
  return {
    id: record.id,
    user_id: record.user_id,
    reading_date: formatDateString(record.reading_date),
    time_slot: record.time_slot,
    time_slot_label: slotInfo ? slotInfo.label : record.time_slot,
    slot_order: slotInfo ? slotInfo.order : 99,
    glucose_value: record.glucose_value,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

async function enforceDailyAndSlotConstraints({
  userId,
  readingDateStr,
  timeSlotCode,
  excludeReadingId = null,
}) {
  const dateObj = toUtcDate(readingDateStr);

  const whereClause = {
    user_id: userId,
    reading_date: dateObj,
  };

  if (excludeReadingId) {
    whereClause.id = { not: excludeReadingId };
  }

  const existingReadingsForDay = await prisma.reading.findMany({
    where: whereClause,
  });

  // BR-04: Maximum four readings per day (checked before duplicate slot so a 5th reading on a full day triggers BR-04)
  if (existingReadingsForDay.length >= 4) {
    throw new AppError('You can add only 4 readings per day.', 409);
  }

  // BR-03: One reading per slot per day
  const duplicateSlot = existingReadingsForDay.find(
    (r) => r.time_slot === timeSlotCode
  );
  if (duplicateSlot) {
    throw new AppError(getDuplicateSlotMessage(timeSlotCode), 409);
  }
}

async function createReading(userId, payload) {
  const { reading_date, time_slot, glucose_value } = validateReadingInput(payload);

  await enforceDailyAndSlotConstraints({
    userId,
    readingDateStr: reading_date,
    timeSlotCode: time_slot,
  });

  const created = await prisma.reading.create({
    data: {
      user_id: userId,
      reading_date: toUtcDate(reading_date),
      time_slot,
      glucose_value,
    },
  });

  // Invalidate cached reports for this user and trigger background cache warmup
  await cacheService.invalidateUserReports(userId);
  const { enqueueReportWarmup } = require('../jobs/jobQueue');
  await enqueueReportWarmup(userId, reading_date);

  return formatReading(created);
}

async function listReadings(userId, query = {}) {
  const { date, from, to, page, limit } = query;

  const where = {
    user_id: userId,
  };

  if (date) {
    if (!isValidDateString(date)) {
      throw new AppError('Invalid date filter. Use YYYY-MM-DD format.', 400);
    }
    where.reading_date = toUtcDate(date);
  } else if (from || to) {
    where.reading_date = {};
    if (from) {
      if (!isValidDateString(from)) {
        throw new AppError('Invalid "from" date filter. Use YYYY-MM-DD format.', 400);
      }
      where.reading_date.gte = toUtcDate(from);
    }
    if (to) {
      if (!isValidDateString(to)) {
        throw new AppError('Invalid "to" date filter. Use YYYY-MM-DD format.', 400);
      }
      where.reading_date.lte = toUtcDate(to);
    }
  }

  const allRecords = await prisma.reading.findMany({
    where,
    orderBy: [{ reading_date: 'desc' }, { created_at: 'asc' }],
  });

  // Sort by reading_date DESC, then by time_slot order (Morning -> Breakfast -> Lunch -> Dinner)
  const formatted = allRecords
    .map(formatReading)
    .sort((a, b) => {
      if (a.reading_date !== b.reading_date) {
        return a.reading_date < b.reading_date ? 1 : -1;
      }
      return a.slot_order - b.slot_order;
    });

  // Optional pagination support
  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const total = formatted.length;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = formatted.slice(startIndex, startIndex + limitNum);

    return {
      readings: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: totalPages,
      },
    };
  }

  return {
    readings: formatted,
    total: formatted.length,
  };
}

async function getReadingById(userId, readingId) {
  validateUuid(readingId);

  const reading = await prisma.reading.findUnique({
    where: { id: readingId },
  });

  if (!reading) {
    throw new AppError('Reading not found.', 404);
  }

  // BR-06: User ownership check
  if (reading.user_id !== userId) {
    throw new AppError('Forbidden: You can only access your own readings.', 403);
  }

  return formatReading(reading);
}

async function updateReading(userId, readingId, payload) {
  validateUuid(readingId);

  const existing = await prisma.reading.findUnique({
    where: { id: readingId },
  });

  if (!existing) {
    throw new AppError('Reading not found.', 404);
  }

  // BR-06: User ownership check
  if (existing.user_id !== userId) {
    throw new AppError('Forbidden: You can only edit your own readings.', 403);
  }

  const { reading_date, time_slot, glucose_value } = validateReadingInput(payload);

  // BR-07: Validate updated record without counting existing record as a duplicate of itself
  await enforceDailyAndSlotConstraints({
    userId,
    readingDateStr: reading_date,
    timeSlotCode: time_slot,
    excludeReadingId: readingId,
  });

  const updated = await prisma.reading.update({
    where: { id: readingId },
    data: {
      reading_date: toUtcDate(reading_date),
      time_slot,
      glucose_value,
    },
  });

  // Invalidate cached reports for this user and trigger background cache warmup
  await cacheService.invalidateUserReports(userId);
  const { enqueueReportWarmup } = require('../jobs/jobQueue');
  await enqueueReportWarmup(userId, reading_date);

  return formatReading(updated);
}

async function deleteReading(userId, readingId) {
  validateUuid(readingId);

  const existing = await prisma.reading.findUnique({
    where: { id: readingId },
  });

  if (!existing) {
    throw new AppError('Reading not found.', 404);
  }

  // BR-06: User ownership check
  if (existing.user_id !== userId) {
    throw new AppError('Forbidden: You can only delete your own readings.', 403);
  }

  await prisma.reading.delete({
    where: { id: readingId },
  });

  // Invalidate cached reports for this user and trigger background cache warmup
  await cacheService.invalidateUserReports(userId);
  const { enqueueReportWarmup } = require('../jobs/jobQueue');
  await enqueueReportWarmup(userId);

  return { id: readingId };
}

module.exports = {
  createReading,
  listReadings,
  getReadingById,
  updateReading,
  deleteReading,
  formatReading,
};
