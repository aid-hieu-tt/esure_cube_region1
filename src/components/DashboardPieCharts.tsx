import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { PieChartData } from '../types';
import { useCrossFilter } from '../context/CrossFilterContext';

function formatVND(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

const COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
  '#64748b',
];

interface ChartBoxProps {
  title: string;
  dimension: string;
  data: PieChartData[];
}

const ChartBox: React.FC<ChartBoxProps> = ({ title, dimension, data }) => {
  const { toggleFilter, getDimStyle, filters } = useCrossFilter();

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-400 shadow-md shadow-slate-200/70">
        <p className="text-sm font-semibold mb-2">{title}</p>
        <p className="text-xs">Không có dữ liệu</p>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // Transform data for MUI X Charts with dynamic colors for cross-filter dimming
  const muiData = data.map((d, index) => {
    const baseColor = COLORS[index % COLORS.length];
    return {
      id: index,
      value: d.value,
      label: d.name,
      color: getDimStyle(dimension, d.name, baseColor),
    };
  });

  return (
    <div className="flex h-[300px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
      <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Phân rã</p>
        <h3 className="mt-1 text-sm font-extrabold tracking-tight text-slate-900">{title}</h3>
      </div>
      <div className="flex h-full w-full flex-1 flex-row items-center justify-center p-2">
        {/* Left 50% for strictly the Pie Chart */}
        <div className="w-[50%] h-full flex justify-center items-center">
          <PieChart
            series={[
              {
                data: muiData,
                outerRadius: 105,
                innerRadius: 0,
                paddingAngle: 1,
                cornerRadius: 3,
                arcLabel: (item) => `${((item.value / total) * 100).toFixed(0)}%`,
                arcLabelMinAngle: 15,
                valueFormatter: (item: number | { value?: number }) => {
                  const val = typeof item === 'number' ? item : item?.value;
                  return val !== undefined && val !== null ? formatVND(val) : '';
                },
              },
            ]}
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
            hideLegend // Hide internal MUI legend
            onItemClick={(event, itemIdentifier) => {
              const item = muiData[itemIdentifier.dataIndex];
              if (item?.label) {
                toggleFilter(dimension, item.label);
              }
            }}
          />
        </div>

        {/* Right 50% strictly for the custom balanced HTML legend */}
        <div className="w-[50%] h-full flex flex-col justify-center px-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            {muiData.map((d) => (
              <div
                key={d.id}
                className="flex cursor-pointer items-center rounded p-1 text-[12px] text-slate-800 transition-colors hover:bg-slate-100"
                onClick={() => toggleFilter(dimension, d.label)}
              >
                <span
                  className="mr-2.5 h-2.5 w-2.5 shrink-0 rounded-full shadow-sm transition-all"
                  style={{ backgroundColor: d.color, opacity: filters[dimension] && filters[dimension] !== d.label ? 0.3 : 1 }}
                ></span>
                <span
                  className={`font-semibold truncate transition-all ${filters[dimension] === d.label ? 'text-blue-700' : ''}`}
                  title={d.label}
                  style={{ opacity: filters[dimension] && filters[dimension] !== d.label ? 0.4 : 1 }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

interface DashboardPieChartsProps {
  pieCharts: {
    product: PieChartData[];
    duration: PieChartData[];
    provider: PieChartData[];
    payment: PieChartData[];
  };
}

export const DashboardPieCharts: React.FC<DashboardPieChartsProps> = ({ pieCharts }) => {
  return (
    <div className="mb-1 grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      <ChartBox title="Sản phẩm" dimension="products" data={pieCharts.product} />
      <ChartBox title="Thời hạn" dimension="durations" data={pieCharts.duration} />
      <ChartBox title="Nhà bảo hiểm" dimension="providers" data={pieCharts.provider} />
      <ChartBox title="Thanh toán" dimension="paymentMethod" data={pieCharts.payment} />
    </div>
  );
};
