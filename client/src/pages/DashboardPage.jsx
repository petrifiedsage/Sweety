import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  BarChart2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
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
import {
  TIME_SLOTS,
  getTodayDateString,
  formatDisplayDate,
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
      const data = await getReadings({ date: selectedDate });
      setReadings(data.readings || []);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to load readings for the selected date.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

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
      showSuccessToast('Reading updated in your logbook.');
    } else {
      await createReading(payload);
      showSuccessToast('Reading logged successfully.');
    }
    if (payload.reading_date !== selectedDate) {
      setSelectedDate(payload.reading_date);
    } else {
      await loadDailyReadings();
    }
  }

  async function handleConfirmDelete(readingId) {
    await deleteReading(readingId);
    showSuccessToast('Reading removed from your logbook.');
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
    <div className="min-h-screen bg-[#F7F6F2] pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Hero Wellness Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full mb-2.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Daily Health Summary</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Your structured 4-slot blood glucose check-in for{' '}
              <span className="font-semibold text-stone-800">
                {formatDisplayDate(selectedDate, true)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-soft"
            >
              <Plus className="h-4 w-4" />
              Log Reading
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-soft">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200/90 px-4 py-3 text-sm font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Apple Health Summary Metric Cards */}
        <section aria-label="Daily statistics">
          <StatCards statistics={dailyStats} maxDaily={4} />
        </section>

        {/* Unified 4-Slot Daily Check-in Grid */}
        <section aria-label="Daily meal-slot check-ins" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-extrabold text-stone-900">
                Daily Check-In Slots
              </h2>
              <p className="text-xs font-medium text-stone-500">
                Tap any empty slot to log a measurement, or edit existing entries directly
              </p>
            </div>

            {readings.length > 0 && (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white px-3.5 py-1.5 rounded-full border border-stone-200/80 shadow-soft">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>
                  {inTargetCount} of {readings.length} in optimal range (70–140 mg/dL)
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-52 rounded-3xl bg-white border border-stone-200/70 p-6 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TIME_SLOTS.map((slot) => {
                const record = readingsBySlot[slot.code];
                const badge = record ? getGlucoseBadgeStyle(record.glucose_value) : null;
                const gaugePct = record ? getGlucoseGaugePercent(record.glucose_value) : 0;

                return (
                  <div
                    key={slot.code}
                    className={`rounded-3xl p-6 transition-all flex flex-col justify-between ${
                      record
                        ? 'bg-white border border-stone-200/90 shadow-soft hover:shadow-card'
                        : 'bg-white/60 border-2 border-dashed border-stone-300/80 hover:border-teal-500/60 hover:bg-white'
                    }`}
                  >
                    {/* Top Row: Slot Icon, Title & Status Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${slot.iconBg}`}
                          >
                            <SlotIcon slotCode={slot.code} className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                                Slot {slot.order}
                              </span>
                            </div>
                            <h3 className="font-display text-lg font-extrabold text-stone-900">
                              {slot.label}
                            </h3>
                            <p className="text-xs font-medium text-stone-500">
                              {slot.timingHint}
                            </p>
                          </div>
                        </div>

                        {badge ? (
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                            Not logged
                          </span>
                        )}
                      </div>

                      {/* Middle Row: Value & Range Bar OR Empty Invitation */}
                      {record ? (
                        <div className="mt-6">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="font-display text-5xl font-extrabold text-stone-900 tracking-tight">
                                {record.glucose_value}
                              </span>
                              <span className="text-sm font-bold text-stone-400">mg/dL</span>
                            </div>
                            <span className="text-xs font-medium text-stone-400">
                              Target: 70–140
                            </span>
                          </div>

                          {/* Visual Range Spectrum Bar */}
                          <div className="mt-3.5">
                            <div className="relative h-2 w-full rounded-full bg-stone-100 overflow-hidden">
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
                        </div>
                      ) : (
                        <div className="mt-6 py-3 px-4 rounded-2xl bg-[#F7F6F2]/80 border border-stone-200/60 flex items-center justify-between">
                          <span className="text-xs font-medium text-stone-500">
                            Ready to record your {slot.label.toLowerCase()} level?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenAdd(slot.code)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Log {slot.shortLabel}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions for Logged Slot */}
                    {record && (
                      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-400">
                          {formatDisplayDate(record.reading_date)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingReading(record)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom Wellness Navigation Cards (Insights & Full Logbook) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Link
            to={`/reports?date=${selectedDate}`}
            className="group bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft hover:shadow-card transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-stone-900 group-hover:text-teal-700 transition-colors">
                  Explore Reports &amp; Monthly Trends
                </h3>
                <p className="text-xs font-medium text-stone-500 mt-0.5">
                  View Daily, Month-to-Date, and Previous Month analytics for{' '}
                  {formatDisplayDate(selectedDate)}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-stone-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>

          <Link
            to="/history"
            className="group bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft hover:shadow-card transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-stone-900 group-hover:text-teal-700 transition-colors">
                  Browse Complete Reading Logbook
                </h3>
                <p className="text-xs font-medium text-stone-500 mt-0.5">
                  Filter historical readings by date range, time slot, and status
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-stone-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
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
    </div>
  );
}
