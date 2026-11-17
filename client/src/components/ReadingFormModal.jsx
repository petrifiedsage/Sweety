import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import SlotIcon from './SlotIcon';
import {
  TIME_SLOTS,
  getTodayDateString,
  getGlucoseBadgeStyle,
  getGlucoseGaugePercent,
} from '../utils/constants';

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

  const trimmedPreview = String(glucoseValue).trim();
  const numericPreview =
    /^-?\d+$/.test(trimmedPreview) && Number(trimmedPreview) >= 40 && Number(trimmedPreview) <= 600
      ? Number(trimmedPreview)
      : null;
  const previewBadge = getGlucoseBadgeStyle(numericPreview);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation matching exact Business Rules (BR-01, BR-02, BR-05)
    if (
      glucoseValue === null ||
      glucoseValue === undefined ||
      String(glucoseValue).trim() === ''
    ) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-modal-title"
    >
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-card w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-stone-100">
          <div>
            <h2
              id="reading-modal-title"
              className="font-display text-xl font-extrabold text-stone-900"
            >
              {isEditing ? 'Edit Glucose Reading' : 'Add Glucose Reading'}
            </h2>
            <p className="text-xs font-medium text-stone-500 mt-0.5">
              Record a meal-slot measurement between 40 and 600 mg/dL
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="h-9 w-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6" noValidate>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200/90 p-4 text-sm font-medium text-rose-700"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Glucose Value Input + Live Range Feedback */}
          <div className="bg-[#F7F6F2] rounded-2xl p-5 border border-stone-200/70">
            <div className="flex items-center justify-between">
              <label
                htmlFor="glucose_value"
                className="block text-xs font-bold uppercase tracking-wider text-stone-500"
              >
                Glucose Value (mg/dL)
              </label>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${previewBadge.bg}`}
              >
                {previewBadge.label}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <input
                id="glucose_value"
                name="glucose_value"
                type="text"
                inputMode="numeric"
                placeholder="115"
                value={glucoseValue}
                onChange={(e) => setGlucoseValue(e.target.value)}
                className="block w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 font-display text-3xl font-extrabold text-stone-900 placeholder-stone-300 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
              />
              <span className="text-sm font-bold text-stone-400 shrink-0">mg/dL</span>
            </div>

            {/* Live Range Gauge */}
            <div className="mt-4">
              <div className="relative h-2 w-full rounded-full bg-stone-200/80 overflow-hidden">
                {/* Target zone highlight 70-140 mg/dL (22% to 62%) */}
                <div
                  className="absolute top-0 bottom-0 bg-emerald-200/60"
                  style={{ left: '22%', width: '40%' }}
                />
                {numericPreview !== null && (
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${previewBadge.bar}`}
                    style={{ width: `${getGlucoseGaugePercent(numericPreview)}%` }}
                  />
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-stone-400">
                <span>40 mg/dL</span>
                <span className="text-emerald-700 font-semibold">Target: 70–140 mg/dL</span>
                <span>600 mg/dL</span>
              </div>
            </div>
          </div>

          {/* Date of Measurement */}
          <div>
            <label
              htmlFor="reading_date"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Date of Measurement
            </label>
            <input
              id="reading_date"
              name="reading_date"
              type="date"
              max={todayStr}
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              className="mt-2 block w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
            />
          </div>

          {/* Time Slot Selector (Accessible Select + Visual Slot Cards) */}
          <div>
            <label
              htmlFor="time_slot"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Time Slot
            </label>

            {/* Accessible native select (kept for keyboard & automated tests) */}
            <select
              id="time_slot"
              name="time_slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="sr-only"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot.code} value={slot.code}>
                  {slot.label}
                </option>
              ))}
            </select>

            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {TIME_SLOTS.map((slot) => {
                const selected = timeSlot === slot.code;
                return (
                  <button
                    key={slot.code}
                    type="button"
                    onClick={() => setTimeSlot(slot.code)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all ${
                      selected
                        ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-600/15'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${slot.iconBg}`}
                    >
                      <SlotIcon slotCode={slot.code} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-stone-900 truncate">{slot.label}</p>
                        {selected && <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {slot.shortLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-300 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-stone-900 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
