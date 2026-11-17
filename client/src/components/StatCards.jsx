import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Hash } from 'lucide-react';

export default function StatCards({ statistics, maxDaily = null }) {
  const highest = statistics?.highest ?? null;
  const lowest = statistics?.lowest ?? null;
  const average = statistics?.average ?? null;
  const total = statistics?.total_readings ?? 0;

  const cards = [
    {
      title: 'Highest Reading',
      value: highest !== null ? `${highest}` : '—',
      unit: highest !== null ? 'mg/dL' : '',
      icon: ArrowUpRight,
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Lowest Reading',
      value: lowest !== null ? `${lowest}` : '—',
      unit: lowest !== null ? 'mg/dL' : '',
      icon: ArrowDownRight,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Average Reading',
      value: average !== null ? `${Number(average).toFixed(1)}` : '—',
      unit: average !== null ? 'mg/dL' : '',
      icon: Activity,
      iconBg: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Total Readings',
      value: `${total}`,
      unit: maxDaily ? `of ${maxDaily} slots` : total === 1 ? 'reading' : 'readings',
      icon: Hash,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                {card.unit && (
                  <span className="text-xs font-medium text-slate-500">{card.unit}</span>
                )}
              </div>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
