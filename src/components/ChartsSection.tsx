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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-sm text-gray-600">Chỉ tiêu: <span className="font-semibold text-orange-500">{formatCurrency(data.target)}</span></p>
          <p className="text-sm text-gray-600">Thực hiện: <span className="font-semibold text-blue-800">{formatCurrency(data.actual)}</span></p>
          <p className="text-sm text-gray-600">Đạt: <span className="font-semibold">{data.completionRate}%</span></p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (data?.name) {
      toggleFilter('regionCodes', data.name);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      {/* Donut Chart */}
      <div className="lg:col-span-4 bg-white rounded-md shadow-sm p-4 h-80 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tiến độ thời gian</h3>
        <div className="flex-1 relative flex items-center justify-center">
          {/* Custom inner text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-[#0a2342] rounded-full flex flex-col items-center justify-center text-white shadow-xl" style={{ width: '130px', height: '130px' }}>
              <span className="text-5xl font-bold leading-none mb-1">{remainingDays}</span>
              <span className="text-xl font-medium leading-tight">Ngày</span>
              <span className="text-sm font-medium opacity-80">Còn lại</span>
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
      <div className="lg:col-span-8 bg-white rounded-md shadow-sm p-4 h-80 flex flex-col w-full overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">So sánh Doanh số & Chỉ tiêu</h3>
        <div className="flex-1 overflow-x-auto overflow-y-hidden w-full">
          <div style={{ minWidth: regions.length > 5 ? `${regions.length * 75}px` : '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regions}
                margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  tick={{ fill: '#374151', fontSize: 11, fontWeight: 700 }} 
                  onClick={(data) => handleBarClick({ name: data.value })}
                  className="cursor-pointer hover:font-bold"
                />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
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
