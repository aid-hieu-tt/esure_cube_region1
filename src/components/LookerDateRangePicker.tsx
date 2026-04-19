import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export type DateRangeValue = string | [string, string];

interface LookerDateRangePickerProps {
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

const PRESETS = [
  { label: 'Auto date range', value: 'This month' }, // Default fallback label, we'll map This month
  { label: 'Today', value: 'Today' },
  { label: 'Yesterday', value: 'Yesterday' },
  { label: 'This week (starts Monday)', value: 'This week' },
  { label: 'Last week (starts Monday)', value: 'Last week' },
  { label: 'Last 7 days', value: 'Last 7 days' },
  { label: 'Last 30 days', value: 'Last 30 days' },
  { label: 'This month', value: 'This month' },
  { label: 'Last month', value: 'Last month' },
  { label: 'This year', value: 'This year' },
  { label: 'Fixed (Custom)', value: 'Fixed' },
];

const getPresetRange = (presetValue: string): [string, string] => {
  const d = new Date();
  const format = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const start = new Date(d);
  const end = new Date(d);

  switch (presetValue) {
    case 'Today':
      break;
    case 'Yesterday':
      start.setDate(d.getDate() - 1);
      end.setDate(d.getDate() - 1);
      break;
    case 'This week':
      const day = d.getDay();
      const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diffToMonday);
      end.setDate(diffToMonday + 6);
      break;
    case 'Last week':
      const lastWeekDay = d.getDay();
      const lastWeekDiffToMonday = d.getDate() - lastWeekDay + (lastWeekDay === 0 ? -6 : 1) - 7;
      start.setDate(lastWeekDiffToMonday);
      end.setDate(lastWeekDiffToMonday + 6);
      break;
    case 'Last 7 days':
      start.setDate(d.getDate() - 6);
      break;
    case 'Last 30 days':
      start.setDate(d.getDate() - 29);
      break;
    case 'This month':
      start.setDate(1);
      end.setMonth(d.getMonth() + 1, 0);
      break;
    case 'Last month':
      start.setMonth(d.getMonth() - 1, 1);
      end.setMonth(d.getMonth(), 0);
      break;
    case 'This year':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
    default:
      return ['', ''];
  }
  return [format(start), format(end)];
};

export const LookerDateRangePicker: React.FC<LookerDateRangePickerProps> = ({
  value = 'This month',
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempType, setTempType] = useState<string>('This month');
  const [tempCustom, setTempCustom] = useState<[string, string]>(['', '']);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize state based on value
  useEffect(() => {
    if (Array.isArray(value)) {
      setTempType('Fixed');
      setTempCustom(value);
    } else {
      setTempType(value);
      setTempCustom(getPresetRange(value));
    }
  }, [value, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleApply = () => {
    if (tempType === 'Fixed') {
      if (tempCustom[0] && tempCustom[1]) {
        onChange([tempCustom[0], tempCustom[1]]);
      } else {
        alert('Vui lòng chọn đầy đủ Từ ngày và Đến ngày.');
        return;
      }
    } else {
      onChange(tempType);
    }
    setIsOpen(false);
  };

  const handlePresetClick = (presetValue: string) => {
    setTempType(presetValue);
    if (presetValue !== 'Fixed') {
      setTempCustom(getPresetRange(presetValue));
    }
  };

  const handleDateChange = (index: 0 | 1, dateVal: string) => {
    setTempType('Fixed');
    const newDates: [string, string] = [tempCustom[0], tempCustom[1]];
    newDates[index] = dateVal;
    setTempCustom(newDates);
  };

  const displayLabel = Array.isArray(value) 
    ? `${value[0]} - ${value[1]}` 
    : (PRESETS.find(p => p.value === value)?.label || value);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Calendar size={16} className="text-gray-500" />
        <span>{displayLabel}</span>
        <ChevronDown size={16} className="text-gray-500 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 lg:w-[480px] bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 flex flex-col lg:flex-row overflow-hidden border border-gray-200">
          
          {/* Presets Column */}
          <div className="w-full lg:w-1/2 max-h-80 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200 py-1 flex flex-col">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Mốc thời gian
            </div>
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={clsx(
                  "flex items-center justify-between w-full text-left px-4 py-2 text-sm",
                  tempType === preset.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {preset.label}
                {tempType === preset.value && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs & Actions */}
          <div className="w-full lg:w-1/2 p-4 bg-gray-50 flex flex-col justify-between">
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Từ ngày</label>
                  <input 
                    type="date" 
                    value={tempCustom[0]}
                    onChange={(e) => handleDateChange(0, e.target.value)}
                    className="w-full px-3 py-2 border border-blue-100 bg-white shadow-sm rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Đến ngày</label>
                  <input 
                    type="date" 
                    min={tempCustom[0]}
                    value={tempCustom[1]}
                    onChange={(e) => handleDateChange(1, e.target.value)}
                    className="w-full px-3 py-2 border border-blue-100 bg-white shadow-sm rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 mt-4 flex justify-end gap-2">
               <button 
                 onClick={() => setIsOpen(false)}
                 className="px-4 py-1.5 text-sm rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleApply}
                 className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm"
               >
                 Apply
               </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
