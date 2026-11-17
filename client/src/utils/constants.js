export const TIME_SLOTS = [
  { code: 'MORNING_FASTING', label: 'Morning (fasting)', order: 1 },
  { code: 'AFTER_BREAKFAST', label: 'After breakfast', order: 2 },
  { code: 'AFTER_LUNCH', label: 'After lunch', order: 3 },
  { code: 'AFTER_DINNER', label: 'After dinner', order: 4 },
];

export const TIME_SLOT_MAP = TIME_SLOTS.reduce((acc, item) => {
  acc[item.code] = item.label;
  acc[item.label] = item.label;
  return acc;
}, {});

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getGlucoseBadgeStyle(value) {
  if (typeof value !== 'number') {
    return {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'N/A',
    };
  }
  if (value < 70) {
    return {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Low',
    };
  }
  if (value <= 140) {
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'In Range',
    };
  }
  if (value <= 180) {
    return {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      label: 'Moderate',
    };
  }
  return {
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    label: 'Elevated',
  };
}
