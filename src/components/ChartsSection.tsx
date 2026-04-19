import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeTrackingData, RegionData } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCrossFilter } from '../context/CrossFilterContext';

interface ChartsSectionProps {
  timeTracking: TimeTrackingData[];
  regions: RegionData[];
  onRegionClick?: (regionName: string) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ timeTracking, regions, onRegionClick }) => {
  const { toggleFilter, getDimStyle, filters } = useCrossFilter();
  const remainingDays = timeTracking.find(t => t.name === 'Còn lại')?.value || 0;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: RegionData }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-sm text-slate-600">Chỉ tiêu: <span className="font-semibold text-orange-500">{formatCurrency(data.target)}</span></p>
          <p className="text-sm text-slate-600">Thực hiện: <span className="font-semibold text-blue-800">{formatCurrency(data.actual)}</span></p>
          <p className="text-sm text-slate-600">Đạt: <span className="font-semibold">{data.completionRate}%</span></p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: { name?: string }) => {
    if (data?.name) {
      toggleFilter('regionCodes', data.name);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
      {/* Donut Chart */}
      <div className="relative flex h-[360px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/70 lg:col-span-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Tiến độ</p>
          <h3 className="mt-1 text-base font-extrabold tracking-tight text-slate-900">Thời gian trong kỳ</h3>
          <p className="mt-1 text-xs font-medium text-slate-600">Nhìn nhanh phần thời gian đã trôi qua và còn lại.</p>
        </div>
        <div className="flex-1 relative flex items-center justify-center">
          {/* Custom inner text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 text-white shadow-xl ring-1 ring-white/15" style={{ width: '130px', height: '130px' }}>
              <span className="text-5xl font-bold leading-none mb-1">{remainingDays}</span>
              <span className="text-xl font-semibold leading-tight">Ngày</span>
              <span className="text-sm font-medium text-white/80">Còn lại</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={timeTracking}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={0}
                dataKey="value"
                isAnimationActive={true}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {timeTracking.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative flex h-[360px] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/70 lg:col-span-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/35 to-transparent" />
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">So sánh</p>
          <h3 className="mt-1 text-base font-extrabold tracking-tight text-slate-900">Doanh số theo vùng</h3>
          <p className="mt-1 text-xs font-medium text-slate-600">Click cột hoặc nhãn trục X để lọc nhanh theo vùng.</p>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-hidden w-full">
          <div style={{ minWidth: regions.length > 5 ? `${regions.length * 75}px` : '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regions}
                margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} 
                  onClick={(data) => handleBarClick({ name: data.value })}
                  className="cursor-pointer hover:font-bold"
                />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.16)' }} />
                <Legend />
                <Bar 
                  dataKey="actual" 
                  name="Thực hiện" 
                  fill="#3b82f6"
                  stackId="a"
                  animationBegin={200}
                  animationDuration={1000}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                >
                  {regions.map((entry, index) => (
                    <Cell 
                      key={`cell-a-${index}`} 
                      fill={getDimStyle('regionCodes', entry.name, '#3b82f6')}
                      stroke={filters['regionCodes'] === entry.name ? '#1e40af' : 'none'}
                      strokeWidth={filters['regionCodes'] === entry.name ? 2 : 0}
                      className="transition-all duration-300"
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="target" 
                  name="Chỉ tiêu" 
                  fill="#f97316"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  animationBegin={200}
                  animationDuration={1000}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                >
                  {regions.map((entry, index) => (
                    <Cell 
                      key={`cell-t-${index}`} 
                      fill={getDimStyle('regionCodes', entry.name, '#f97316')}
                      stroke={filters['regionCodes'] === entry.name ? '#c2410c' : 'none'}
                      strokeWidth={filters['regionCodes'] === entry.name ? 2 : 0}
                      className="transition-all duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
