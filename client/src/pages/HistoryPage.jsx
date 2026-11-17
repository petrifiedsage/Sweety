import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ReadingFormModal from '../components/ReadingFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getReadings,
  createReading,
  updateReading,
  deleteReading,
} from '../api/readingsApi';
import {
  getTodayDateString,
  formatDisplayDate,
  getGlucoseBadgeStyle,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  function handleResetFilters() {
    setFromDate('');
    setToDate('');
    setPage(1);
  }

  async function handleSaveReading(payload) {
    if (editingReading) {
      await updateReading(editingReading.id, payload);
    } else {
      await createReading(payload);
    }
    await fetchHistory();
  }

  async function handleConfirmDelete(id) {
    await deleteReading(id);
    await fetchHistory();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reading History</h1>
            <p className="mt-1 text-sm text-slate-600">
              View, filter, edit, or delete your historical blood glucose records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingReading(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Reading
          </button>
        </div>

        {/* Date Range Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mr-2 self-center">
            <Filter className="h-4 w-4 text-teal-600" />
            <span>Filter by Date</span>
          </div>

          <div>
            <label htmlFor="from-date" className="block text-xs font-medium text-slate-500">
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
              className="mt-1 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="to-date" className="block text-xs font-medium text-slate-500">
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
              className="mt-1 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Readings Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading reading history...
            </div>
          ) : readings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-base font-semibold text-slate-800">No readings found</p>
              <p className="mt-1 text-sm text-slate-500">
                {fromDate || toDate
                  ? 'No glucose readings match the selected date filter.'
                  : 'You have not recorded any blood glucose measurements yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Time Slot
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Glucose Value
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {readings.map((reading) => {
                      const badge = getGlucoseBadgeStyle(reading.glucose_value);
                      return (
                        <tr key={reading.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                            {formatDisplayDate(reading.reading_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-700">
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
                              onClick={() => {
                                setEditingReading(reading);
                                setFormOpen(true);
                              }}
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

              {/* Pagination Controls */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
                  <span className="font-semibold">{pagination.total_pages}</span> ({pagination.total}{' '}
                  total records)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
