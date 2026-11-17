const AppError = require('../utils/AppError');
const { normalizeTimeSlot } = require('../utils/timeSlots');
const { getTodayDateString, isValidDateString } = require('../utils/dateUtils');

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUuid(id, label = 'Reading ID') {
  if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new AppError(`Invalid ${label}.`, 400);
  }
}

function validateReadingInput(body = {}) {
  const { reading_date, time_slot, glucose_value } = body;

  // BR-01: Required glucose value
  if (
    glucose_value === undefined ||
    glucose_value === null ||
    (typeof glucose_value === 'string' && glucose_value.trim() === '')
  ) {
    throw new AppError('Please enter a glucose value.', 400);
  }

  // BR-02: Glucose value must be a whole number between 40 and 600 mg/dL, inclusive
  let parsedGlucose = NaN;
  if (typeof glucose_value === 'number') {
    parsedGlucose = glucose_value;
  } else if (typeof glucose_value === 'string') {
    const trimmed = glucose_value.trim();
    if (/^-?\d+$/.test(trimmed)) {
      parsedGlucose = Number(trimmed);
    }
  }

  if (
    !Number.isInteger(parsedGlucose) ||
    parsedGlucose < 40 ||
    parsedGlucose > 600
  ) {
    throw new AppError('Value must be between 40 and 600 mg/dl.', 400);
  }

  // Validate reading_date presence and format
  if (!reading_date || typeof reading_date !== 'string' || !isValidDateString(reading_date)) {
    throw new AppError('Please provide a valid date in YYYY-MM-DD format.', 400);
  }

  const normalizedDate = reading_date.trim();
  const todayStr = getTodayDateString();

  // BR-05: No future dates
  if (normalizedDate > todayStr) {
    throw new AppError('Date cannot be in the future.', 400);
  }

  // Validate supported time slots (FR-03)
  const normalizedSlot = normalizeTimeSlot(time_slot);
  if (!normalizedSlot) {
    throw new AppError(
      'Invalid time slot. Allowed values are Morning (fasting), After breakfast, After lunch, and After dinner.',
      400
    );
  }

  return {
    reading_date: normalizedDate,
    time_slot: normalizedSlot,
    glucose_value: parsedGlucose,
  };
}

module.exports = {
  validateReadingInput,
  validateUuid,
};
