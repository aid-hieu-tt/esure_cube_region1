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
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Calendar size={16} className="text-slate-500" />
        <span>{displayLabel}</span>
        <ChevronDown size={16} className={`ml-1 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 ring-1 ring-black/5 lg:w-[480px] lg:flex-row">
          
          {/* Presets Column */}
          <div className="flex max-h-80 w-full flex-col overflow-y-auto border-b border-slate-200 py-1 lg:w-1/2 lg:border-b-0 lg:border-r">
            <div className="bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mốc thời gian
            </div>
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={clsx(
                  "flex w-full items-center justify-between px-4 py-2 text-left text-sm",
                  tempType === preset.value ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {preset.label}
                {tempType === preset.value && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs & Actions */}
          <div className="flex w-full flex-col justify-between bg-slate-50 p-4 lg:w-1/2">
            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Từ ngày</label>
                  <input 
                    type="date" 
                    value={tempCustom[0]}
                    onChange={(e) => handleDateChange(0, e.target.value)}
                    className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Đến ngày</label>
                  <input 
                    type="date" 
                    min={tempCustom[0]}
                    value={tempCustom[1]}
                    onChange={(e) => handleDateChange(1, e.target.value)}
                    className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
               <button 
                 onClick={() => setIsOpen(false)}
                 className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleApply}
                 className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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
