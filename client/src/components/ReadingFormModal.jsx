import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { TIME_SLOTS, getTodayDateString } from '../utils/constants';

export default function ReadingFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  defaultDate = '',
  defaultSlot = 'MORNING_FASTING',
}) {
  const isEditing = Boolean(initialData?.id);
  const todayStr = getTodayDateString();

  const [readingDate, setReadingDate] = useState(defaultDate || todayStr);
  const [timeSlot, setTimeSlot] = useState(defaultSlot || 'MORNING_FASTING');
  const [glucoseValue, setGlucoseValue] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialData) {
        setReadingDate(initialData.reading_date || defaultDate || todayStr);
        setTimeSlot(initialData.time_slot || 'MORNING_FASTING');
        setGlucoseValue(
          initialData.glucose_value !== undefined && initialData.glucose_value !== null
            ? String(initialData.glucose_value)
            : ''
        );
      } else {
        setReadingDate(defaultDate || todayStr);
        setTimeSlot(defaultSlot || 'MORNING_FASTING');
        setGlucoseValue('');
      }
    }
  }, [isOpen, initialData, defaultDate, defaultSlot, todayStr]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation matching exact Business Rules (BR-01, BR-02, BR-05)
    if (glucoseValue === null || glucoseValue === undefined || String(glucoseValue).trim() === '') {
      setError('Please enter a glucose value.');
      return;
    }

    const trimmedVal = String(glucoseValue).trim();
    const numericVal = /^-?\d+$/.test(trimmedVal) ? Number(trimmedVal) : NaN;

    if (!Number.isInteger(numericVal) || numericVal < 40 || numericVal > 600) {
      setError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    if (!readingDate) {
      setError('Please select a reading date.');
      return;
    }

    if (readingDate > getTodayDateString()) {
      setError('Date cannot be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        reading_date: readingDate,
        time_slot: timeSlot,
        glucose_value: numericVal,
      });
      onClose();
    } catch (err) {
      const apiError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to save reading.';
      setError(apiError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="reading-modal-title" className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Glucose Reading' : 'Add Glucose Reading'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="reading_date" className="block text-sm font-medium text-slate-700">
              Date of Measurement
            </label>
            <input
              id="reading_date"
              name="reading_date"
              type="date"
              max={todayStr}
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="time_slot" className="block text-sm font-medium text-slate-700">
              Time Slot
            </label>
            <select
              id="time_slot"
              name="time_slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 sm:text-sm"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot.code} value={slot.code}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="glucose_value" className="block text-sm font-medium text-slate-700">
              Glucose Value (mg/dL)
            </label>
            <input
              id="glucose_value"
              name="glucose_value"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 115 (40 – 600 mg/dL)"
              value={glucoseValue}
              onChange={(e) => setGlucoseValue(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Enter a whole number between 40 and 600 mg/dL.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-xs"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
