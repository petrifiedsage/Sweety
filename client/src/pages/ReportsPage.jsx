import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, FileBarChart, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import {
  fetchDailyReport,
  fetchMonthToDateReport,
  fetchMonthlyReport,
} from '../api/reportsApi';
import {
  getTodayDateString,
  formatDisplayDate,
  getGlucoseBadgeStyle,
} from '../utils/constants';

const REPORT_TABS = [
  {
    id: 'daily',
    label: 'Daily Report',
    description: 'Statistics and individual slot readings for the selected calendar date.',
  },
  {
    id: 'mtd',
    label: 'Month-to-Date (MTD)',
    description: 'Statistics from the first day of the selected month through the selected date.',
  },
  {
    id: 'monthly',
    label: 'Previous Month',
    description: 'Statistics across the entire previous calendar month.',
  },
];

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStr = getTodayDateString();

  const initialDate = searchParams.get('date') || todayStr;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState('daily');

  const [reports, setReports] = useState({
    daily: null,
    mtd: null,
    monthly: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [daily, mtd, monthly] = await Promise.all([
        fetchDailyReport(selectedDate),
        fetchMonthToDateReport(selectedDate),
        fetchMonthlyReport(selectedDate),
      ]);
      setReports({ daily, mtd, monthly });
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to generate reports for the selected date.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function handleDateChange(newDate) {
    setSelectedDate(newDate);
    if (newDate) {
      setSearchParams({ date: newDate });
    }
  }

  const currentReport = reports[activeTab];
  const currentTabMeta = REPORT_TABS.find((t) => t.id === activeTab);
  const hasReadings = (currentReport?.statistics?.total_readings || 0) > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Reference Date Picker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Glucose Reports</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review daily, month-to-date, and previous-month blood glucose statistics.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 self-start md:self-auto">
            <Calendar className="h-4 w-4 text-teal-600" />
            <label htmlFor="report-date" className="text-xs font-medium text-slate-600">
              Selected Date:
            </label>
            <input
              id="report-date"
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {REPORT_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
            Calculating report statistics...
          </div>
        ) : (
          currentReport && (
            <div className="space-y-6">
              {/* Period Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{currentTabMeta?.label}</h2>
                  <p className="text-xs text-slate-500">{currentTabMeta?.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 border border-teal-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                  <span>Date Range:</span>
                  <span>
                    {currentReport.date_range.from === currentReport.date_range.to
                      ? formatDisplayDate(currentReport.date_range.from)
                      : `${formatDisplayDate(currentReport.date_range.from)} – ${formatDisplayDate(
                          currentReport.date_range.to
                        )}`}
                  </span>
                </div>
              </div>

              {/* Statistics Summary Cards */}
              <StatCards
                statistics={currentReport.statistics}
                maxDaily={activeTab === 'daily' ? 4 : null}
              />

              {/* Empty State vs Reading Breakdown */}
              {!hasReadings ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                    <FileBarChart className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    No readings recorded for this period
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                    There are no blood glucose measurements between{' '}
                    <span className="font-medium text-slate-700">
                      {formatDisplayDate(currentReport.date_range.from)}
                    </span>{' '}
                    and{' '}
                    <span className="font-medium text-slate-700">
                      {formatDisplayDate(currentReport.date_range.to)}
                    </span>
                    .
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">
                      {activeTab === 'daily'
                        ? 'Daily Reading Breakdown'
                        : 'Readings Included in Report'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentReport.statistics.total_readings}{' '}
                      {currentReport.statistics.total_readings === 1
                        ? 'measurement'
                        : 'measurements'}{' '}
                      in selected period
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {activeTab !== 'daily' && (
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Date
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Time Slot
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Value (mg/dL)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {currentReport.readings.map((r) => {
                          const badge = getGlucoseBadgeStyle(r.glucose_value);
                          return (
                            <tr key={r.id} className="hover:bg-slate-50/70">
                              {activeTab !== 'daily' && (
                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-700">
                                  {formatDisplayDate(r.reading_date)}
                                </td>
                              )}
                              <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-900">
                                {r.time_slot_label}
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                <span className="font-bold text-slate-900">
                                  {r.glucose_value} mg/dL
                                </span>
                                <span
                                  className={`ml-2.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                                >
                                  {badge.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
