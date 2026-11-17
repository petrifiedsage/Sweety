import React from 'react';
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { getGlucoseBadgeStyle, getGlucoseGaugePercent } from '../utils/constants';

export default function StatCards({ statistics, maxDaily = null }) {
  const highest = statistics?.highest ?? null;
  const lowest = statistics?.lowest ?? null;
  const average = statistics?.average ?? null;
  const total = statistics?.total_readings ?? 0;

  const avgStyle =
    average !== null ? getGlucoseBadgeStyle(Math.round(average)) : getGlucoseBadgeStyle(null);

  // SVG Ring calculation when maxDaily is provided (e.g. 4 slots per day)
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = maxDaily ? Math.min(1, total / maxDaily) : total > 0 ? 1 : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Average Reading Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 px-5 py-4 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Average Glucose
          </span>
          <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Activity className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-stone-900">
              {average !== null ? Number(average).toFixed(1) : '—'}
            </span>
            {average !== null && (
              <span className="text-xs font-semibold text-stone-400">mg/dL</span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${avgStyle.dot}`} />
            <span className="text-xs font-semibold text-stone-600">
              {average !== null ? avgStyle.label : 'No readings'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Lowest Reading Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 px-5 py-4 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Lowest Reading
          </span>
          <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ArrowDownRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-stone-900">
              {lowest !== null ? lowest : '—'}
            </span>
            {lowest !== null && (
              <span className="text-xs font-semibold text-stone-400">mg/dL</span>
            )}
          </div>

          <div className="mt-2.5 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            {lowest !== null && (
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${getGlucoseGaugePercent(lowest)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Highest Reading Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 px-5 py-4 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Highest Reading
          </span>
          <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-stone-900">
              {highest !== null ? highest : '—'}
            </span>
            {highest !== null && (
              <span className="text-xs font-semibold text-stone-400">mg/dL</span>
            )}
          </div>

          <div className="mt-2.5 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            {highest !== null && (
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: `${getGlucoseGaugePercent(highest)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. Total Readings & Completion Ring */}
      <div className="bg-white rounded-3xl border border-stone-200/80 px-5 py-4 shadow-soft flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {maxDaily ? 'Daily Check-ins' : 'Total Readings'}
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-stone-900">{total}</span>
            <span className="text-xs font-semibold text-stone-400">
              {maxDaily ? `/ ${maxDaily} slots` : total === 1 ? 'reading' : 'readings'}
            </span>
          </div>
        </div>

        {/* SVG Activity Ring */}
        <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="#F5F5F4"
              strokeWidth="5"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="#0D9488"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute text-[11px] font-extrabold text-stone-800">
            {maxDaily ? `${Math.round(progressRatio * 100)}%` : total}
          </span>
        </div>
      </div>
    </div>
  );
}
