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
    <div className="bg-white rounded-3xl border border-stone-200/90 px-6 py-5 shadow-soft">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-display text-base font-extrabold text-stone-900">{title}</h3>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            Average
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Highest
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Lowest
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#78716C" strokeOpacity={0.2} vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#A8A29E', fontWeight: 500 }}
              stroke="#78716C"
              strokeOpacity={0.3}
              tickLine={false}
            />
            <YAxis
              domain={[40, 'auto']}
              tick={{ fontSize: 11, fill: '#A8A29E', fontWeight: 500 }}
              stroke="#78716C"
              strokeOpacity={0.3}
              tickLine={false}
              unit=" mg"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                backgroundColor: 'rgba(28, 25, 23, 0.92)',
                borderColor: '#44403C',
                color: '#FAFAF9',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                fontSize: '12px',
                fontWeight: 600,
              }}
              itemStyle={{ color: '#FAFAF9' }}
              labelStyle={{ color: '#A8A29E', marginBottom: '4px' }}
            />
            <ReferenceLine y={140} stroke="#10B981" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="average"
              name="Average (mg/dL)"
              stroke="#0D9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#avgGradient)"
              dot={{ r: 3.5, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="highest"
              name="Highest (mg/dL)"
              stroke="#F43F5E"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 3, fill: '#F43F5E' }}
            />
            <Line
              type="monotone"
              dataKey="lowest"
              name="Lowest (mg/dL)"
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
