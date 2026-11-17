import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileBarChart, AlertCircle, CalendarRange } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import DateNavigator from '../components/DateNavigator';
import SlotIcon from '../components/SlotIcon';
import GlucoseTrendChart from '../components/GlucoseTrendChart';
import {
  fetchDailyReport,
  fetchMonthToDateReport,
  fetchMonthlyReport,
} from '../api/reportsApi';
import {
  getTodayDateString,
  formatDisplayDate,
  getGlucoseBadgeStyle,
  getGlucoseGaugePercent,
  getSlotMeta,
} from '../utils/constants';

const REPORT_TABS = [
  {
    id: 'daily',
    label: 'Daily Report',
    shortLabel: 'Daily',
    description: 'Detailed statistics and slot breakdown for the selected calendar date.',
  },
  {
    id: 'mtd',
    label: 'Month-to-Date',
    shortLabel: 'Month-to-Date',
    description: 'Cumulative statistics from the 1st of the selected month through the selected date.',
  },
  {
    id: 'monthly',
    label: 'Previous Month',
    shortLabel: 'Previous Month',
    description: 'Complete statistical summary across the entire previous calendar month.',
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
  const readings = currentReport?.readings || [];
  const hasReadings = (currentReport?.statistics?.total_readings || 0) > 0;

  // Compute Time-in-Range distribution percentages
  const rangeDistribution = useMemo(() => {
    if (!readings.length) return null;
    const total = readings.length;
    const low = readings.filter((r) => r.glucose_value < 70).length;
    const inTarget = readings.filter(
      (r) => r.glucose_value >= 70 && r.glucose_value <= 140
    ).length;
    const moderate = readings.filter(
      (r) => r.glucose_value > 140 && r.glucose_value <= 180
    ).length;
    const high = readings.filter((r) => r.glucose_value > 180).length;

    return {
      lowPct: Math.round((low / total) * 100),
      inTargetPct: Math.round((inTarget / total) * 100),
      moderatePct: Math.round((moderate / total) * 100),
      highPct: Math.round((high / total) * 100),
      inTargetCount: inTarget,
      total,
    };
  }, [readings]);

  return (
    <div className="min-h-screen bg-[#F7F6F2] pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Top Header & Date Navigator */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Analytics &amp; Summaries
            </span>
            <h1 className="font-display text-3xl font-extrabold text-stone-900 mt-0.5">
              Glucose Insights
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Compare your daily, month-to-date, and previous-month blood glucose metrics.
            </p>
          </div>

          <DateNavigator
            id="report-date"
            selectedDate={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Apple Health Segmented Control + Period Banner */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 bg-stone-100 p-1.5 rounded-full border border-stone-200/70 self-start">
            {REPORT_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    active
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {currentReport && (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-700 bg-[#F7F6F2] px-4 py-2 rounded-full border border-stone-200/80 self-start md:self-auto">
              <CalendarRange className="h-4 w-4 text-teal-600" />
              <span className="text-stone-500">Report Period:</span>
              <span className="font-bold text-stone-900">
                {currentReport.date_range.from === currentReport.date_range.to
                  ? formatDisplayDate(currentReport.date_range.from, true)
                  : `${formatDisplayDate(currentReport.date_range.from)} – ${formatDisplayDate(
                      currentReport.date_range.to
                    )}`}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-14 text-center text-sm font-medium text-stone-500">
            Calculating report statistics...
          </div>
        ) : (
          currentReport && (
            <div className="space-y-6">
              {/* 4 Summary Metric Cards */}
              <StatCards
                statistics={currentReport.statistics}
                maxDaily={activeTab === 'daily' ? 4 : null}
              />

              {!hasReadings ? (
                <div className="bg-white rounded-3xl border border-stone-200/80 p-14 text-center shadow-soft">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center">
                    <FileBarChart className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-extrabold text-stone-900">
                    No readings in this period
                  </h3>
                  <p className="mt-1.5 text-sm text-stone-500 max-w-md mx-auto">
                    There are no recorded measurements between{' '}
                    <span className="font-semibold text-stone-800">
                      {formatDisplayDate(currentReport.date_range.from)}
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-stone-800">
                      {formatDisplayDate(currentReport.date_range.to)}
                    </span>
                    . Select another date above or log a new reading.
                  </p>
                </div>
              ) : (
                <>
                  {/* Time-in-Range Distribution Bar */}
                  {rangeDistribution && (
                    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-soft">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <div>
                          <h3 className="font-display text-lg font-extrabold text-stone-900">
                            Time in Range Distribution
                          </h3>
                          <p className="text-xs font-medium text-stone-500">
                            {rangeDistribution.inTargetCount} of {rangeDistribution.total}{' '}
                            readings ({rangeDistribution.inTargetPct}%) fell within the optimal
                            70–140 mg/dL target zone
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                          {rangeDistribution.inTargetPct}% In Target Range
                        </span>
                      </div>

                      {/* Segmented Bar */}
                      <div className="h-3.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
                        {rangeDistribution.lowPct > 0 && (
                          <div
                            className="bg-amber-400 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.lowPct}%` }}
                            title={`Below Target (<70): ${rangeDistribution.lowPct}%`}
                          />
                        )}
                        {rangeDistribution.inTargetPct > 0 && (
                          <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.inTargetPct}%` }}
                            title={`In Target (70–140): ${rangeDistribution.inTargetPct}%`}
                          />
                        )}
                        {rangeDistribution.moderatePct > 0 && (
                          <div
                            className="bg-sky-500 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.moderatePct}%` }}
                            title={`Slightly Elevated (141–180): ${rangeDistribution.moderatePct}%`}
                          />
                        )}
                        {rangeDistribution.highPct > 0 && (
                          <div
                            className="bg-rose-500 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.highPct}%` }}
                            title={`High (>180): ${rangeDistribution.highPct}%`}
                          />
                        )}
                      </div>

                      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-stone-600">
                            In Range (70–140):{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.inTargetPct}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                          <span className="text-stone-600">
                            141–180 mg/dL:{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.moderatePct}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                          <span className="text-stone-600">
                            Below 70 mg/dL:{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.lowPct}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                          <span className="text-stone-600">
                            Above 180 mg/dL:{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.highPct}%
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Recharts Trend Chart */}
                  <GlucoseTrendChart
                    readings={readings}
                    title={`${currentTabMeta?.label} — Glucose Trend`}
                  />

                  {/* Detailed Readings Breakdown */}
                  <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
                    <div className="px-7 py-5 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg font-extrabold text-stone-900">
                          {activeTab === 'daily'
                            ? 'Daily Reading History'
                            : 'Measurements Included in Report'}
                        </h3>
                        <p className="text-xs font-medium text-stone-500 mt-0.5">
                          {currentTabMeta?.description}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                        {readings.length} {readings.length === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {readings.map((r) => {
                        const badge = getGlucoseBadgeStyle(r.glucose_value);
                        const slotMeta = getSlotMeta(r.time_slot);
                        const gaugePct = getGlucoseGaugePercent(r.glucose_value);

                        return (
                          <div
                            key={r.id}
                            className="px-7 py-4 flex items-center justify-between gap-4 hover:bg-[#F7F6F2]/50 transition-colors"
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${slotMeta.iconBg}`}
                              >
                                <SlotIcon slotCode={r.time_slot} className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-display text-sm font-extrabold text-stone-900">
                                  {r.time_slot_label}
                                </p>
                                <p className="text-xs font-medium text-stone-500">
                                  {formatDisplayDate(r.reading_date, true)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-5">
                              <div className="w-28 hidden sm:block">
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

                              <span
                                className={`hidden md:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                {badge.label}
                              </span>

                              <div className="text-right min-w-[85px]">
                                <span className="font-display text-xl font-extrabold text-stone-900">
                                  {r.glucose_value}
                                </span>
                                <span className="ml-1 text-xs font-bold text-stone-400">
                                  mg/dL
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
