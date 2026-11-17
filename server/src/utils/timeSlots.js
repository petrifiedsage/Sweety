const TIME_SLOTS = {
  MORNING_FASTING: {
    code: 'MORNING_FASTING',
    label: 'Morning (fasting)',
    article: 'a',
    order: 1,
  },
  AFTER_BREAKFAST: {
    code: 'AFTER_BREAKFAST',
    label: 'After breakfast',
    article: 'an',
    order: 2,
  },
  AFTER_LUNCH: {
    code: 'AFTER_LUNCH',
    label: 'After lunch',
    article: 'an',
    order: 3,
  },
  AFTER_DINNER: {
    code: 'AFTER_DINNER',
    label: 'After dinner',
    article: 'an',
    order: 4,
  },
};

const TIME_SLOT_LIST = Object.values(TIME_SLOTS).sort((a, b) => a.order - b.order);

function normalizeTimeSlot(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();

  if (TIME_SLOTS[upper]) {
    return TIME_SLOTS[upper].code;
  }

  const matched = TIME_SLOT_LIST.find(
    (slot) => slot.label.toLowerCase() === trimmed.toLowerCase()
  );

  return matched ? matched.code : null;
}

function getTimeSlotInfo(codeOrLabel) {
  const code = normalizeTimeSlot(codeOrLabel);
  return code ? TIME_SLOTS[code] : null;
}

function getDuplicateSlotMessage(codeOrLabel) {
  const info = getTimeSlotInfo(codeOrLabel);
  if (!info) {
    return 'You already have a reading for this time slot on this date.';
  }
  return `You already have ${info.article} ${info.label} reading for this date.`;
}

module.exports = {
  TIME_SLOTS,
  TIME_SLOT_LIST,
  normalizeTimeSlot,
  getTimeSlotInfo,
  getDuplicateSlotMessage,
};
