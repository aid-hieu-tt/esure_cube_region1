import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ProviderDailyRevenue } from '../types';
import { useCrossFilter } from '../context/CrossFilterContext';

const PROVIDER_COLORS: Record<string, string> = {
  BaoLong: '#2563eb',
  'BảoViệt': '#059669',
  DBV: '#d97706',
  MIC: '#dc2626',
  PVI: '#7c3aed',
};

const DEFAULT_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d'];

function formatVND(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

interface ProviderRevenueChartProps {
  data: ProviderDailyRevenue[];
  providerNames: string[];
}

export const ProviderRevenueChart: React.FC<ProviderRevenueChartProps> = ({ data, providerNames }) => {
  const { toggleFilter, filters } = useCrossFilter();

  if (!data || data.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 shadow-md shadow-slate-200/70">
        Không có dữ liệu để hiển thị
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-900/60">Xu hướng</p>
        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="text-sm font-extrabold tracking-tight text-slate-900">Doanh thu theo nhà bảo hiểm</h3>
          <span className="text-xs font-semibold text-slate-600">Click legend/điểm để lọc</span>
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tickFormatter={formatVND}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              width={55}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatVND(value), name]}
              labelFormatter={(label) => `Ngày: ${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 12px 28px -12px rgba(15, 23, 42, 0.35)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px', cursor: 'pointer' }}
              iconType="circle"
              iconSize={8}
              onClick={(entry: { dataKey?: string }) => {
                if (entry?.dataKey) toggleFilter('providers', String(entry.dataKey));
              }}
            />
            {providerNames.map((name, i) => {
              const isFilteredOut = filters['providers'] && filters['providers'] !== name;
              return (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  name={name}
                  stroke={PROVIDER_COLORS[name] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                  strokeOpacity={isFilteredOut ? 0.2 : 1}
                  strokeWidth={filters['providers'] === name ? 3 : 2}
                  dot={{ r: 3, fill: PROVIDER_COLORS[name] || DEFAULT_COLORS[i % DEFAULT_COLORS.length], opacity: isFilteredOut ? 0.2 : 1 }}
                  activeDot={{ 
                    r: 5, 
                    onClick: (_event: unknown, payload: { dataKey: string }) => toggleFilter('providers', payload.dataKey),
                    style: { cursor: 'pointer' }
                  }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
