import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Bell,
  X,
} from 'lucide-react';
import StatCards from '../components/StatCards';
import DateNavigator from '../components/DateNavigator';
import SlotIcon from '../components/SlotIcon';
import ReadingFormModal from '../components/ReadingFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useAuth } from '../context/AuthContext';
import {
  getReadings,
  createReading,
  updateReading,
  deleteReading,
} from '../api/readingsApi';
import { getDailyReminder } from '../api/jobsApi';
import {
  TIME_SLOTS,
  getTodayDateString,
  getGlucoseBadgeStyle,
  getGlucoseGaugePercent,
} from '../utils/constants';

function calculateLocalStats(readings) {
  if (!readings || readings.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      total_readings: 0,
    };
  }
  const values = readings.map((r) => r.glucose_value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = Math.round((sum / values.length) * 10) / 10;

  return {
    highest,
    lowest,
    average,
    total_readings: readings.length,
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const todayStr = getTodayDateString();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [readings, setReadings] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [defaultSlot, setDefaultSlot] = useState('MORNING_FASTING');
  const [deletingReading, setDeletingReading] = useState(null);

  const loadDailyReadings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [readingsData, reminderData] = await Promise.all([
        getReadings({ date: selectedDate }),
        selectedDate === todayStr
          ? getDailyReminder(selectedDate).catch(() => null)
          : Promise.resolve(null),
      ]);
      setReadings(readingsData.readings || []);
      setReminder(reminderData?.reminder || null);
      setReminderDismissed(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to load readings for the selected date.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate, todayStr]);

  useEffect(() => {
    loadDailyReadings();
  }, [loadDailyReadings]);

  function showSuccessToast(message) {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3500);
  }

  function handleOpenAdd(slotCode = null) {
    setEditingReading(null);
    if (slotCode) {
      setDefaultSlot(slotCode);
    } else {
      const usedSlots = new Set(readings.map((r) => r.time_slot));
      const firstAvailable = TIME_SLOTS.find((s) => !usedSlots.has(s.code));
      setDefaultSlot(firstAvailable ? firstAvailable.code : 'MORNING_FASTING');
    }
    setFormOpen(true);
  }

  function handleOpenEdit(reading) {
    setEditingReading(reading);
    setFormOpen(true);
  }

  async function handleSaveReading(payload) {
    if (editingReading) {
      await updateReading(editingReading.id, payload);
      showSuccessToast('Reading updated.');
    } else {
      await createReading(payload);
      showSuccessToast('Reading logged.');
    }
    if (payload.reading_date !== selectedDate) {
      setSelectedDate(payload.reading_date);
    } else {
      await loadDailyReadings();
    }
  }

  async function handleConfirmDelete(readingId) {
    await deleteReading(readingId);
    showSuccessToast('Reading removed.');
    await loadDailyReadings();
  }

  const dailyStats = calculateLocalStats(readings);
  const readingsBySlot = readings.reduce((acc, r) => {
    acc[r.time_slot] = r;
    return acc;
  }, {});

  const inTargetCount = readings.filter(
    (r) => r.glucose_value >= 70 && r.glucose_value <= 140
  ).length;

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col justify-between gap-4">
        {/* Top Greeting & Date Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
            {getGreeting()}, {firstName}
          </h1>

          <div className="flex flex-wrap items-center gap-2.5">
            <DateNavigator
              id="dashboard-date"
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />

            <button
              type="button"
              onClick={() => handleOpenAdd()}
              disabled={readings.length >= 4}
              title={
                readings.length >= 4
                  ? 'All 4 daily slots are filled for this date'
                  : 'Log a blood glucose reading'
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-xs sm:text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-soft"
            >
              <Plus className="h-4 w-4" />
              Log Reading
            </button>
          </div>
        </div>

        {/* BullMQ Unlogged Slot Reminder Banner (shown for today when slots are missing) */}
        {!loading &&
          selectedDate === todayStr &&
          reminder &&
          !reminder.is_complete &&
          !reminderDismissed &&
          reminder.missing_slots?.length > 0 && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-800/70 px-4 py-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-soft animate-fade-in"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">{reminder.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenAdd(reminder.missing_slots[0].code)}
                  className="px-3 py-1 rounded-full bg-amber-600 text-white hover:bg-amber-700 text-[11px] font-bold transition-colors"
                >
                  Log {reminder.missing_slots[0].label}
                </button>
                <button
                  type="button"
                  onClick={() => setReminderDismissed(true)}
                  aria-label="Dismiss reminder"
                  className="p-1 rounded-full text-amber-700 dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

        {/* Toast / Error Alerts */}
        {(toast || error) && (
          <div>
            {toast && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/90 px-4 py-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{toast}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200/90 px-4 py-2 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* 4 Summary Metric Cards */}
        <section aria-label="Daily statistics">
          <StatCards statistics={dailyStats} maxDaily={4} />
        </section>

        {/* Unified 2x2 Daily Check-In Slots Grid */}
        <section aria-label="Daily meal-slot check-ins" className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-display text-lg font-extrabold text-stone-900">
              Daily Check-In Slots
            </h2>

            {readings.length > 0 && (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200/80 shadow-soft">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  {inTargetCount} of {readings.length} in target range (70–140 mg/dL)
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl bg-white border border-stone-200/70 p-5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {TIME_SLOTS.map((slot) => {
                const record = readingsBySlot[slot.code];
                const badge = record ? getGlucoseBadgeStyle(record.glucose_value) : null;
                const gaugePct = record ? getGlucoseGaugePercent(record.glucose_value) : 0;

                return (
                  <div
                    key={slot.code}
                    className={`rounded-3xl px-6 py-4 transition-all flex flex-col justify-between ${record
                      ? 'bg-white border border-stone-200/90 shadow-soft hover:shadow-card'
                      : 'bg-white/60 border-2 border-dashed border-stone-300/80 hover:border-teal-500/60 hover:bg-white'
                      }`}
                  >
                    {/* Top Row: Slot Icon, Title & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${slot.iconBg}`}
                        >
                          <SlotIcon slotCode={slot.code} className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                            Slot {slot.order}
                          </span>
                          <h3 className="font-display text-base font-extrabold text-stone-900">
                            {slot.label}
                          </h3>
                          <p className="text-[11px] font-medium text-stone-500">
                            {slot.timingHint}
                          </p>
                        </div>
                      </div>

                      {badge ? (
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
                          Not logged
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Value + Range Bar + Edit/Delete OR Log Button */}
                    {record ? (
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                              {record.glucose_value}
                            </span>
                            <span className="text-xs font-bold text-stone-400">mg/dL</span>
                          </div>
                          <div className="mt-2 relative h-1.5 w-full max-w-[200px] rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className="absolute top-0 bottom-0 bg-emerald-200/60"
                              style={{ left: '22%', width: '40%' }}
                            />
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${badge.bar}`}
                              style={{ width: `${gaugePct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingReading(record)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 py-2.5 px-3.5 rounded-2xl bg-[#F7F6F2]/80 border border-stone-200/60 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-stone-500 truncate">
                          No measurement logged
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAdd(slot.code)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Log {slot.shortLabel}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <ReadingFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveReading}
        initialData={editingReading}
        defaultDate={selectedDate}
        defaultSlot={defaultSlot}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingReading)}
        onClose={() => setDeletingReading(null)}
        onConfirm={handleConfirmDelete}
        reading={deletingReading}
      />
    </>
  );
}
