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
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden p-8 text-center text-gray-400">
        Không có dữ liệu để hiển thị
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#d9e1f2] text-center py-2 font-bold text-gray-900 border-b border-gray-300">
        Doanh thu theo Nhà bảo hiểm
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tickFormatter={formatVND}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={55}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatVND(value), name]}
              labelFormatter={(label) => `Ngày: ${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px', cursor: 'pointer' }}
              iconType="circle"
              iconSize={8}
              onClick={(e: any) => {
                if (e && e.dataKey) toggleFilter('providers', String(e.dataKey));
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
                    onClick: (event: any, payload: any) => toggleFilter('providers', payload.dataKey),
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
