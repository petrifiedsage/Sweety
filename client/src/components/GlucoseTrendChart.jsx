import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { formatDisplayDate } from '../utils/constants';

export default function GlucoseTrendChart({ readings = [], title = 'Glucose Trend' }) {
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];

    // Group readings by reading_date and compute daily min, max, average
    const byDate = new Map();
    for (const r of readings) {
      const dateKey = r.reading_date;
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey).push(r.glucose_value);
    }

    const sortedDates = Array.from(byDate.keys()).sort();
    return sortedDates.map((dateStr) => {
      const values = byDate.get(dateStr);
      const sum = values.reduce((a, b) => a + b, 0);
      const average = Math.round((sum / values.length) * 10) / 10;
      const highest = Math.max(...values);
      const lowest = Math.min(...values);

      return {
        date: dateStr,
        displayDate: formatDisplayDate(dateStr),
        average,
        highest,
        lowest,
        count: values.length,
      };
    });
  }, [readings]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-soft">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-extrabold text-stone-900">{title}</h3>
          <p className="text-xs font-medium text-stone-500 mt-0.5">
            Daily average, peak, and minimum blood glucose measurements (mg/dL)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
            Daily Average
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Daily High
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Daily Low
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#78716C', fontWeight: 500 }}
              stroke="#D6D3D1"
              tickLine={false}
            />
            <YAxis
              domain={[40, 'auto']}
              tick={{ fontSize: 11, fill: '#78716C', fontWeight: 500 }}
              stroke="#D6D3D1"
              tickLine={false}
              unit=" mg"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                borderColor: '#E7E5E4',
                boxShadow: '0 10px 25px -5px rgba(28, 25, 23, 0.08)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
            <ReferenceLine y={140} stroke="#10B981" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="average"
              name="Daily Average (mg/dL)"
              stroke="#0D9488"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#avgGradient)"
              dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="highest"
              name="Daily High (mg/dL)"
              stroke="#F43F5E"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 3, fill: '#F43F5E' }}
            />
            <Line
              type="monotone"
              dataKey="lowest"
              name="Daily Low (mg/dL)"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 3, fill: '#F59E0B' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
