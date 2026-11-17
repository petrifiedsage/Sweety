import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Pencil,
  Trash2,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
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
      showSuccessToast('Reading updated successfully.');
    } else {
      await createReading(payload);
      showSuccessToast('Reading added successfully.');
    }
    if (payload.reading_date !== selectedDate) {
      setSelectedDate(payload.reading_date);
    } else {
      await loadDailyReadings();
    }
  }

  async function handleConfirmDelete(readingId) {
    await deleteReading(readingId);
    showSuccessToast('Reading deleted.');
    await loadDailyReadings();
  }

  const dailyStats = calculateLocalStats(readings);
  const readingsBySlot = readings.reduce((acc, r) => {
    acc[r.time_slot] = r;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Date Selector Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name || 'there'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track up to four meal-based blood glucose measurements each day.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              <label htmlFor="dashboard-date" className="text-xs font-medium text-slate-600">
                Date:
              </label>
              <input
                id="dashboard-date"
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Add Reading
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Daily Statistics Cards */}
        <section aria-label="Daily statistics">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">
              Daily Summary — {formatDisplayDate(selectedDate)}
            </h2>
            <Link
              to={`/reports?date=${selectedDate}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              <BarChart3 className="h-4 w-4" />
              View Full Reports
            </Link>
          </div>
          <StatCards statistics={dailyStats} maxDaily={4} />
        </section>

        {/* Daily 4 Time Slots Grid */}
        <section aria-label="Daily time slots">
          <h2 className="text-base font-bold text-slate-800 mb-3">
            Daily Time Slots ({readings.length}/4 recorded)
          </h2>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              Loading daily readings...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TIME_SLOTS.map((slot) => {
                const record = readingsBySlot[slot.code];
                const badge = record ? getGlucoseBadgeStyle(record.glucose_value) : null;

                return (
                  <div
                    key={slot.code}
                    className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                      record
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-slate-50/70 border-dashed border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-teal-600" />
                          Slot {slot.order}
                        </span>
                        {badge && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-base font-bold text-slate-900">{slot.label}</h3>

                      {record ? (
                        <div className="mt-3 flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-slate-900">
                            {record.glucose_value}
                          </span>
                          <span className="text-xs font-medium text-slate-500">mg/dL</span>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-400">No reading recorded</p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      {record ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingReading(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAdd(slot.code)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Record {slot.label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Daily Reading History Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Readings for {formatDisplayDate(selectedDate)}
              </h2>
              <p className="text-xs text-slate-500">
                Manage measurements recorded on the selected date
              </p>
            </div>
            <Link
              to="/history"
              className="text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              All History →
            </Link>
          </div>

          {readings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No readings recorded for {formatDisplayDate(selectedDate)}.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click &ldquo;Add Reading&rdquo; above to log your first measurement for this date.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Time Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Glucose Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {readings.map((reading) => {
                    const badge = getGlucoseBadgeStyle(reading.glucose_value);
                    return (
                      <tr key={reading.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                          {formatDisplayDate(reading.reading_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                          {reading.time_slot_label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900">
                            {reading.glucose_value} mg/dL
                          </span>
                          <span
                            className={`ml-2.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(reading)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingReading(reading)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
    </div>
  );
}
