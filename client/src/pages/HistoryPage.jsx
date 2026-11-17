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
  SlidersHorizontal,
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
  const [periodPreset, setPeriodPreset] = useState('ALL');
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
    setPeriodPreset('ALL');
    setFromDate('');
    setToDate('');
    setSlotFilter('ALL');
    setPage(1);
  }

  function applyQuickRange(preset) {
    setPeriodPreset(preset);
    if (preset === 'ALL') {
      setFromDate('');
      setToDate('');
    } else if (preset === '7D') {
      setFromDate(shiftDateString(todayStr, -6));
      setToDate(todayStr);
    } else if (preset === 'MONTH') {
      const [y, m] = todayStr.split('-');
      setFromDate(`${y}-${m}-01`);
      setToDate(todayStr);
    }
    setPage(1);
  }

  async function handleSaveReading(payload) {
    if (editingReading) {
      await updateReading(editingReading.id, payload);
      showToast('Reading updated.');
    } else {
      await createReading(payload);
      showToast('Reading logged.');
    }
    await fetchHistory();
  }

  async function handleConfirmDelete(id) {
    await deleteReading(id);
    showToast('Reading removed.');
    await fetchHistory();
  }

  const displayedReadings =
    slotFilter === 'ALL'
      ? readings
      : readings.filter((r) => r.time_slot === slotFilter);

  const hasActiveFilters = Boolean(fromDate || toDate || slotFilter !== 'ALL');

  return (
    <div className="min-h-screen bg-[#F7F6F2] pb-10">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Page Header — Consistent with Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
            History
          </h1>

          <button
            type="button"
            onClick={() => {
              setEditingReading(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-xs sm:text-sm font-semibold text-white hover:bg-teal-700 transition-all shadow-soft self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Log Reading
          </button>
        </div>

        {toast && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/90 px-4 py-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Unified Filters Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 px-5 py-3.5 shadow-soft flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
              Filters
            </span>

            {/* Period Pills */}
            <div className="inline-flex items-center bg-[#F7F6F2] p-1 rounded-full border border-stone-200/80">
              {[
                { id: 'ALL', label: 'All Time' },
                { id: '7D', label: 'Last 7 Days' },
                { id: 'MONTH', label: 'This Month' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyQuickRange(item.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    periodPreset === item.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Meal Slot Pills */}
            <div className="inline-flex flex-wrap items-center bg-[#F7F6F2] p-1 rounded-full border border-stone-200/80">
              <button
                type="button"
                onClick={() => setSlotFilter('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  slotFilter === 'ALL'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Slots
              </button>
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.code}
                  type="button"
                  onClick={() => setSlotFilter(slot.code)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    slotFilter === slot.code
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <SlotIcon slotCode={slot.code} className="h-3 w-3" />
                  <span>{slot.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Inputs & Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#F7F6F2] px-3 py-1.5 rounded-full border border-stone-200/80">
              <label htmlFor="from-date" className="text-[11px] font-semibold text-stone-400">
                From
              </label>
              <input
                id="from-date"
                type="date"
                max={todayStr}
                value={fromDate}
                onChange={(e) => {
                  setPeriodPreset('CUSTOM');
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#F7F6F2] px-3 py-1.5 rounded-full border border-stone-200/80">
              <label htmlFor="to-date" className="text-[11px] font-semibold text-stone-400">
                To
              </label>
              <input
                id="to-date"
                type="date"
                max={todayStr}
                value={toDate}
                onChange={(e) => {
                  setPeriodPreset('CUSTOM');
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
              />
            </div>

            {hasActiveFilters && (
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

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* History List — Card Typography & Button Sizing Consistent with Dashboard */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-xs font-medium text-stone-500">
              Loading history...
            </div>
          ) : displayedReadings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-10 w-10 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-base font-extrabold text-stone-900">
                No readings found
              </h3>
              <p className="mt-1 text-xs font-medium text-stone-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Try adjusting your filters to view more entries.'
                  : 'No blood glucose readings have been logged yet.'}
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
                      className="px-6 py-4 hover:bg-[#F7F6F2]/60 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      {/* Left: Slot Icon, Slot Title & Date (Matches Dashboard Slot Card Header) */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${slotMeta.iconBg}`}
                        >
                          <SlotIcon slotCode={reading.time_slot} className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-base font-extrabold text-stone-900">
                              {reading.time_slot_label}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-stone-500">
                            {formatDisplayDate(reading.reading_date, true)} · {slotMeta.timingHint}
                          </p>
                        </div>
                      </div>

                      {/* Right: Range Gauge, Glucose Value, and Edit/Delete Buttons (Matches Dashboard) */}
                      <div className="flex items-center justify-between sm:justify-end gap-5">
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
                        </div>

                        <div className="flex items-baseline gap-1 min-w-[90px] justify-end">
                          <span className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                            {reading.glucose_value}
                          </span>
                          <span className="text-xs font-bold text-stone-400">mg/dL</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
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
              <div className="px-6 py-3.5 bg-[#F7F6F2]/70 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
                <span className="font-medium">
                  Page <span className="font-bold text-stone-900">{pagination.page}</span> of{' '}
                  <span className="font-bold text-stone-900">{pagination.total_pages}</span> ·{' '}
                  <span className="font-bold text-stone-900">{pagination.total}</span> total readings
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
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
