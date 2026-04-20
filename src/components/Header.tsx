import React from 'react';
import { Settings } from 'lucide-react';
import { LookerDateRangePicker, DateRangeValue } from './LookerDateRangePicker';

interface HeaderProps {
  onOpenSettings?: () => void;
  onDateChange?: (value: DateRangeValue) => void;
  dateValue?: DateRangeValue;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onDateChange, dateValue }) => {
  return (
    <div className="relative z-30 overflow-visible rounded-3xl border border-white/70 bg-white/80 p-4 shadow-lg shadow-slate-200/80 backdrop-blur md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/70 via-white/0 to-indigo-50/60 rounded-3xl overflow-hidden" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-400/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-indigo-400/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </div>
        <h1 className="mt-3 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-700 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
          Dashboard Chi Nhanh
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
          Tổng quan số liệu kinh doanh theo thời gian thực cho đơn vị chi nhánh.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <LookerDateRangePicker
          value={dateValue} 
          onChange={(val) => onDateChange?.(val)} 
        />

        <button
          onClick={onOpenSettings}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
          title="Cài đặt hệ thống"
        >
          <Settings size={20} className="transition-transform duration-200 group-hover:rotate-45" />
        </button>
      </div>
      </div>
    </div>
  );
};
