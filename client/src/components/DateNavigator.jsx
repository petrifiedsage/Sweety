import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import {
  getTodayDateString,
  shiftDateString,
  formatDisplayDate,
  getRelativeDateLabel,
} from '../utils/constants';

export default function DateNavigator({
  selectedDate,
  onChange,
  id = 'date-navigator-input',
}) {
  const inputRef = useRef(null);
  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;
  const relativeLabel = getRelativeDateLabel(selectedDate);

  function handlePrevDay() {
    onChange(shiftDateString(selectedDate, -1));
  }

  function handleNextDay() {
    if (isToday) return;
    const next = shiftDateString(selectedDate, 1);
    onChange(next > todayStr ? todayStr : next);
  }

  function handleOpenPicker() {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
          return;
        } catch {
          // Fallback to focus
        }
      }
      inputRef.current.focus();
    }
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center bg-white border border-stone-200/90 rounded-full p-1 shadow-soft">
        <button
          type="button"
          onClick={handlePrevDay}
          title="Previous day"
          aria-label="Previous day"
          className="h-8 w-8 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative flex items-center">
          <button
            type="button"
            onClick={handleOpenPicker}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-teal-600" />
            {relativeLabel && (
              <span className="text-teal-700 font-bold">{relativeLabel} ·</span>
            )}
            <span>{formatDisplayDate(selectedDate, !relativeLabel)}</span>
          </button>

          <input
            ref={inputRef}
            id={id}
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              }
            }}
            aria-label="Select date"
            className="sr-only"
          />
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          disabled={isToday}
          title={isToday ? 'Cannot select future dates' : 'Next day'}
          aria-label="Next day"
          className="h-8 w-8 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!isToday && (
        <button
          type="button"
          onClick={() => onChange(todayStr)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Today
        </button>
      )}
    </div>
  );
}
