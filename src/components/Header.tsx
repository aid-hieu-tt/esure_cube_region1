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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard VIETBANK Miền Nam</h1>
        <p className="text-gray-500 mt-1">Tổng quan số liệu kinh doanh khu vực VIETBANK Miền Nam</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-3">
        <LookerDateRangePicker 
          value={dateValue} 
          onChange={(val) => onDateChange?.(val)} 
        />
        
        <button 
          onClick={onOpenSettings}
          className="bg-white p-2 rounded-md shadow-sm border border-gray-300 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          title="Cài đặt hệ thống"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};
