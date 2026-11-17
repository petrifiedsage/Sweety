import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            Daily average, highest, and lowest blood glucose levels (mg/dL)
          </p>
        </div>
        <span className="text-xs text-slate-500">
          Target reference range: 70 – 140 mg/dL
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <YAxis
              domain={[40, 'auto']}
              tick={{ fontSize: 12, fill: '#64748b' }}
              stroke="#cbd5e1"
              unit=" mg/dL"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                borderColor: '#e2e8f0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <ReferenceLine y={140} stroke="#10b981" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="highest"
              name="Daily High"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="average"
              name="Daily Average"
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="lowest"
              name="Daily Low"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
