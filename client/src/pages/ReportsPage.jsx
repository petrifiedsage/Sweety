import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileBarChart, AlertCircle, CalendarRange } from 'lucide-react';
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
    label: 'Daily',
  },
  {
    id: 'mtd',
    label: 'This Month',
  },
  {
    id: 'monthly',
    label: 'Last Month',
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
  const readings = currentReport?.readings || [];
  const hasReadings = (currentReport?.statistics?.total_readings || 0) > 0;

  // Compute simple Reading Breakdown percentages
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
    <>
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Top Header & Date Navigator — Consistent with Dashboard & History */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
            Reports
          </h1>

          <DateNavigator
            id="report-date"
            selectedDate={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Report Switcher & Date Range Bar — Consistent with History Filter Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 px-5 py-3.5 shadow-soft flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center bg-[#F7F6F2] p-1 rounded-full border border-stone-200/80">
            {REPORT_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {currentReport && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 bg-[#F7F6F2] px-3.5 py-1.5 rounded-full border border-stone-200/80">
              <CalendarRange className="h-3.5 w-3.5 text-teal-600" />
              <span className="font-bold text-stone-800">
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
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-10 text-center text-xs font-medium text-stone-500">
            Loading report...
          </div>
        ) : (
          currentReport && (
            <div className="space-y-4">
              {/* 4 Summary Metric Cards */}
              <StatCards
                statistics={currentReport.statistics}
                maxDaily={activeTab === 'daily' ? 4 : null}
              />

              {!hasReadings ? (
                <div className="bg-white rounded-3xl border border-stone-200/90 p-12 text-center shadow-soft">
                  <div className="mx-auto h-10 w-10 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center">
                    <FileBarChart className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-extrabold text-stone-900">
                    No readings for this period
                  </h3>
                  <p className="mt-1 text-xs font-medium text-stone-500 max-w-sm mx-auto">
                    No blood glucose readings were logged between{' '}
                    <span className="font-semibold text-stone-800">
                      {formatDisplayDate(currentReport.date_range.from)}
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-stone-800">
                      {formatDisplayDate(currentReport.date_range.to)}
                    </span>
                    .
                  </p>
                </div>
              ) : (
                <>
                  {/* Simple Healthy Range Breakdown */}
                  {rangeDistribution && (
                    <div className="bg-white rounded-3xl border border-stone-200/90 px-6 py-5 shadow-soft">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-display text-base font-extrabold text-stone-900">
                            Healthy Range Summary
                          </h3>
                          <p className="text-[11px] font-medium text-stone-500">
                            {rangeDistribution.inTargetCount} of {rangeDistribution.total}{' '}
                            readings were normal (70–140 mg/dL)
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                          {rangeDistribution.inTargetPct}% Normal
                        </span>
                      </div>

                      {/* Segmented Bar */}
                      <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
                        {rangeDistribution.lowPct > 0 && (
                          <div
                            className="bg-amber-400 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.lowPct}%` }}
                          />
                        )}
                        {rangeDistribution.inTargetPct > 0 && (
                          <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.inTargetPct}%` }}
                          />
                        )}
                        {rangeDistribution.moderatePct > 0 && (
                          <div
                            className="bg-sky-500 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.moderatePct}%` }}
                          />
                        )}
                        {rangeDistribution.highPct > 0 && (
                          <div
                            className="bg-rose-500 h-full transition-all duration-500"
                            style={{ width: `${rangeDistribution.highPct}%` }}
                          />
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-stone-600">
                            Normal (70–140):{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.inTargetPct}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                          <span className="text-stone-600">
                            Slightly High (141–180):{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.moderatePct}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="text-stone-600">
                            Low (&lt;70):{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.lowPct}%
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          <span className="text-stone-600">
                            High (&gt;180):{' '}
                            <strong className="text-stone-900">
                              {rangeDistribution.highPct}%
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Recharts Trend Chart */}
                  <GlucoseTrendChart readings={readings} title="Glucose Trend" />

                  {/* Readings List — Matches Dashboard & History Sizing */}
                  <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden">
                    <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                      <h3 className="font-display text-base font-extrabold text-stone-900">
                        Readings
                      </h3>
                      <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                        {readings.length} {readings.length === 1 ? 'reading' : 'readings'}
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
                            className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-[#F7F6F2]/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${slotMeta.iconBg}`}
                              >
                                <SlotIcon slotCode={r.time_slot} className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-display text-base font-extrabold text-stone-900">
                                    {r.time_slot_label}
                                  </h4>
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                                  >
                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                    {badge.label}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium text-stone-500">
                                  {formatDisplayDate(r.reading_date, true)} · {slotMeta.timingHint}
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

                              <div className="flex items-baseline gap-1 min-w-[90px] justify-end">
                                <span className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                                  {r.glucose_value}
                                </span>
                                <span className="text-xs font-bold text-stone-400">
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
    </>
  );
}
