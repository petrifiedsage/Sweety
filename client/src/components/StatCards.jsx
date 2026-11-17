import React from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { getGlucoseBadgeStyle, getGlucoseGaugePercent } from '../utils/constants';

export default function StatCards({ statistics, maxDaily = null }) {
  const highest = statistics?.highest ?? null;
  const lowest = statistics?.lowest ?? null;
  const average = statistics?.average ?? null;
  const total = statistics?.total_readings ?? 0;

  const avgStyle =
    average !== null ? getGlucoseBadgeStyle(Math.round(average)) : getGlucoseBadgeStyle(null);

  // SVG Ring calculation when maxDaily is provided (e.g. 4 slots per day)
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = maxDaily ? Math.min(1, total / maxDaily) : total > 0 ? 1 : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Average Reading Card (Primary Wellness Highlight) */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Average Glucose
          </span>
          <div className="h-9 w-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Activity className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-stone-900">
              {average !== null ? Number(average).toFixed(1) : '—'}
            </span>
            {average !== null && (
              <span className="text-xs font-semibold text-stone-400">mg/dL</span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${avgStyle.dot}`} />
            <span className="text-xs font-semibold text-stone-600">
              {average !== null ? avgStyle.label : 'No readings yet'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Lowest Reading Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Lowest Reading
          </span>
          <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ArrowDownRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-stone-900">
              {lowest !== null ? lowest : '—'}
            </span>
            {lowest !== null && (
              <span className="text-xs font-semibold text-stone-400">mg/dL</span>
            )}
          </div>

          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
              {lowest !== null && (
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${getGlucoseGaugePercent(lowest)}%` }}
                />
              )}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-stone-400">
              {lowest !== null ? 'Minimum recorded level' : 'Awaiting measurements'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Highest Reading Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Highest Reading
          </span>
          <div className="h-9 w-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-stone-900">
              {highest !== null ? highest : '—'}
            </span>
            {highest !== null && (
              <span className="text-xs font-semibold text-stone-400">mg/dL</span>
            )}
          </div>

          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
              {highest !== null && (
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${getGlucoseGaugePercent(highest)}%` }}
                />
              )}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-stone-400">
              {highest !== null ? 'Peak recorded level' : 'Awaiting measurements'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Total Readings & Apple Health Style Completion Ring */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            {maxDaily ? 'Daily Check-ins' : 'Total Readings'}
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-extrabold text-stone-900">{total}</span>
            <span className="text-xs font-semibold text-stone-400">
              {maxDaily ? `/ ${maxDaily} slots` : total === 1 ? 'reading' : 'readings'}
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-teal-700 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
            {maxDaily
              ? total === maxDaily
                ? 'All daily slots complete!'
                : `${maxDaily - total} slot${maxDaily - total === 1 ? '' : 's'} remaining`
              : 'Included in period'}
          </p>
        </div>

        {/* SVG Activity Ring */}
        <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#F5F5F4"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#0D9488"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute text-xs font-extrabold text-stone-800">
            {maxDaily ? `${Math.round(progressRatio * 100)}%` : total}
          </span>
        </div>
      </div>
    </div>
  );
}
