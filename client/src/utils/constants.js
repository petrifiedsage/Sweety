export const TIME_SLOTS = [
  {
    code: 'MORNING_FASTING',
    label: 'Morning (fasting)',
    shortLabel: 'Fasting',
    timingHint: 'Before breakfast · 8+ hrs fast',
    accentBg: 'bg-amber-50 dark:bg-amber-950/50',
    accentText: 'text-amber-700 dark:text-amber-300',
    accentBorder: 'border-amber-200/80 dark:border-amber-800/60',
    iconBg: 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
    order: 1,
  },
  {
    code: 'AFTER_BREAKFAST',
    label: 'After breakfast',
    shortLabel: 'Post-Breakfast',
    timingHint: '1–2 hours after morning meal',
    accentBg: 'bg-sky-50 dark:bg-sky-950/50',
    accentText: 'text-sky-700 dark:text-sky-300',
    accentBorder: 'border-sky-200/80 dark:border-sky-800/60',
    iconBg: 'bg-sky-100/80 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300',
    order: 2,
  },
  {
    code: 'AFTER_LUNCH',
    label: 'After lunch',
    shortLabel: 'Post-Lunch',
    timingHint: '1–2 hours after midday meal',
    accentBg: 'bg-teal-50 dark:bg-teal-950/50',
    accentText: 'text-teal-700 dark:text-teal-300',
    accentBorder: 'border-teal-200/80 dark:border-teal-800/60',
    iconBg: 'bg-teal-100/80 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300',
    order: 3,
  },
  {
    code: 'AFTER_DINNER',
    label: 'After dinner',
    shortLabel: 'Post-Dinner',
    timingHint: '1–2 hours after evening meal',
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    accentText: 'text-indigo-700 dark:text-indigo-300',
    accentBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
    iconBg: 'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
    order: 4,
  },
];

export const TIME_SLOT_MAP = TIME_SLOTS.reduce((acc, item) => {
  acc[item.code] = item.label;
  acc[item.label] = item.label;
  return acc;
}, {});

export function getSlotMeta(codeOrLabel) {
  return (
    TIME_SLOTS.find(
      (s) => s.code === codeOrLabel || s.label.toLowerCase() === String(codeOrLabel).toLowerCase()
    ) || TIME_SLOTS[0]
  );
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateString(dateStr, deltaDays) {
  if (!dateStr) return getTodayDateString();
  const [year, month, day] = dateStr.split('-').map(Number);
  const dt = new Date(year, month - 1, day);
  dt.setDate(dt.getDate() + deltaDays);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr, includeWeekday = false) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    ...(includeWeekday ? { weekday: 'short' } : {}),
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getRelativeDateLabel(dateStr) {
  const today = getTodayDateString();
  const yesterday = shiftDateString(today, -1);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return null;
}

export function getGlucoseBadgeStyle(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return {
      bg: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
      dot: 'bg-stone-400',
      bar: 'bg-stone-300 dark:bg-stone-600',
      text: 'text-stone-600 dark:text-stone-300',
      label: 'Not Logged',
      description: 'Enter a value between 40 and 600 mg/dL',
    };
  }
  if (value < 70) {
    return {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      label: 'Below Target',
      description: 'Below 70 mg/dL (Hypoglycemia range)',
    };
  }
  if (value <= 140) {
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      label: 'In Target Range',
      description: 'Optimal target zone (70–140 mg/dL)',
    };
  }
  if (value <= 180) {
    return {
      bg: 'bg-sky-50 text-sky-800 border-sky-200/90 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/70',
      dot: 'bg-sky-500',
      bar: 'bg-sky-500',
      text: 'text-sky-700 dark:text-sky-300',
      label: 'Slightly Elevated',
      description: 'Acceptable post-meal range (141–180 mg/dL)',
    };
  }
  return {
    bg: 'bg-rose-50 text-rose-800 border-rose-200/90 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70',
      dot: 'bg-rose-500',
      bar: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-300',
      label: 'High',
      description: 'Above 180 mg/dL (Hyperglycemia range)',
  };
}

/**
 * Maps a glucose value (40..600) to a visual percentage (5%..96%) along a non-linear clinical gauge
 * so the 70-180 physiological range has generous visual resolution.
 */
export function getGlucoseGaugePercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  const clamped = Math.max(40, Math.min(600, value));
  if (clamped <= 70) {
    // 40..70 maps to 4%..22%
    return 4 + ((clamped - 40) / 30) * 18;
  }
  if (clamped <= 140) {
    // 70..140 maps to 22%..62%
    return 22 + ((clamped - 70) / 70) * 40;
  }
  if (clamped <= 180) {
    // 140..180 maps to 62%..80%
    return 62 + ((clamped - 140) / 40) * 18;
  }
  // 180..600 maps to 80%..96%
  return 80 + ((clamped - 180) / 420) * 16;
}
