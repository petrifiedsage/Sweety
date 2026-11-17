import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SlotIcon from '../components/SlotIcon';
import ReadingFormModal from '../components/ReadingFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getReadings,
  createReading,
  updateReading,
  deleteReading,
} from '../api/readingsApi';
import {
  TIME_SLOTS,
  getTodayDateString,
  shiftDateString,
  formatDisplayDate,
  getGlucoseBadgeStyle,
  getGlucoseGaugePercent,
  getSlotMeta,
} from '../utils/constants';

export default function HistoryPage() {
  const todayStr = getTodayDateString();

  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [slotFilter, setSlotFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [deletingReading, setDeletingReading] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const data = await getReadings(params);
      setReadings(data.readings || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reading history.');
    } finally {
      setLoading(false);
    }
  }, [page, fromDate, toDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleResetFilters() {
    setFromDate('');
    setToDate('');
    setSlotFilter('ALL');
    setPage(1);
  }

  function applyQuickRange(days) {
    if (days === 'MONTH') {
      const [y, m] = todayStr.split('-');
      setFromDate(`${y}-${m}-01`);
      setToDate(todayStr);
    } else {
      setFromDate(shiftDateString(todayStr, -days));
      setToDate(todayStr);
    }
    setPage(1);
  }

  async function handleSaveReading(payload) {
    if (editingReading) {
      await updateReading(editingReading.id, payload);
      showToast('Reading updated successfully.');
    } else {
      await createReading(payload);
      showToast('Reading logged successfully.');
    }
    await fetchHistory();
  }

  async function handleConfirmDelete(id) {
    await deleteReading(id);
    showToast('Reading removed from your logbook.');
    await fetchHistory();
  }

  const displayedReadings =
    slotFilter === 'ALL'
      ? readings
      : readings.filter((r) => r.time_slot === slotFilter);

  return (
    <div className="min-h-screen bg-[#F7F6F2] pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Historical Records
            </span>
            <h1 className="font-display text-3xl font-extrabold text-stone-900 mt-0.5">
              Glucose Logbook
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Review, filter, edit, or remove your recorded blood glucose measurements.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingReading(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-soft self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Log Reading
          </button>
        </div>

        {toast && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-soft">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-soft space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Quick Date Range Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-1">
                Period:
              </span>
              <button
                type="button"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !fromDate && !toDate
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange(6)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200/70 transition-all"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange('MONTH')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200/70 transition-all"
              >
                This Month
              </button>
            </div>

            {/* Custom Date Inputs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[#F7F6F2] px-3 py-1.5 rounded-full border border-stone-200">
                <label htmlFor="from-date" className="text-xs font-semibold text-stone-500">
                  From
                </label>
                <input
                  id="from-date"
                  type="date"
                  max={todayStr}
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#F7F6F2] px-3 py-1.5 rounded-full border border-stone-200">
                <label htmlFor="to-date" className="text-xs font-semibold text-stone-500">
                  To
                </label>
                <input
                  id="to-date"
                  type="date"
                  max={todayStr}
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                />
              </div>

              {(fromDate || toDate || slotFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Slot Filter Pill Strip */}
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-1">
              Meal Slot:
            </span>
            <button
              type="button"
              onClick={() => setSlotFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                slotFilter === 'ALL'
                  ? 'bg-teal-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              All Slots
            </button>
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.code}
                type="button"
                onClick={() => setSlotFilter(slot.code)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  slotFilter === slot.code
                    ? 'bg-teal-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                <SlotIcon slotCode={slot.code} className="h-3.5 w-3.5" />
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Logbook List Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-stone-500">
              Loading your glucose logbook...
            </div>
          ) : displayedReadings.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-extrabold text-stone-900">
                No readings match your filter
              </h3>
              <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
                {fromDate || toDate || slotFilter !== 'ALL'
                  ? 'Try adjusting your date range or meal-slot filter to view more entries.'
                  : 'Start logging your daily blood glucose measurements to build your history.'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-stone-100">
                {displayedReadings.map((reading) => {
                  const badge = getGlucoseBadgeStyle(reading.glucose_value);
                  const slotMeta = getSlotMeta(reading.time_slot);
                  const gaugePct = getGlucoseGaugePercent(reading.glucose_value);

                  return (
                    <div
                      key={reading.id}
                      className="p-5 sm:px-7 hover:bg-[#F7F6F2]/60 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      {/* Left: Slot Icon, Slot Label & Date */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${slotMeta.iconBg}`}
                        >
                          <SlotIcon slotCode={reading.time_slot} className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-display text-base font-extrabold text-stone-900">
                              {reading.time_slot_label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-stone-500 mt-0.5">
                            {formatDisplayDate(reading.reading_date, true)} · {slotMeta.timingHint}
                          </p>
                        </div>
                      </div>

                      {/* Right: Value, Mini Range Gauge, and Edit/Delete Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="w-28 hidden md:block">
                          <div className="relative h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className="absolute top-0 bottom-0 bg-emerald-200/60"
                              style={{ left: '22%', width: '40%' }}
                            />
                            <div
                              className={`h-full rounded-full ${badge.bar}`}
                              style={{ width: `${gaugePct}%` }}
                            />
                          </div>
                          <span className="block text-[10px] font-medium text-stone-400 mt-1 text-right">
                            70–140 target
                          </span>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="font-display text-2xl font-extrabold text-stone-900">
                            {reading.glucose_value}
                          </span>
                          <span className="ml-1 text-xs font-bold text-stone-400">mg/dL</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReading(reading);
                              setFormOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingReading(reading)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Footer */}
              <div className="px-7 py-4 bg-[#F7F6F2]/70 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
                <span className="font-medium">
                  Page <span className="font-bold text-stone-900">{pagination.page}</span> of{' '}
                  <span className="font-bold text-stone-900">{pagination.total_pages}</span> ·{' '}
                  <span className="font-bold text-stone-900">{pagination.total}</span> total readings
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-stone-300 bg-white font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-stone-300 bg-white font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <ReadingFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveReading}
        initialData={editingReading}
        defaultDate={todayStr}
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
