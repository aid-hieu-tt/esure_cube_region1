import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  metric?: number;
}

function formatMetric(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(Math.round(value));
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  loading?: boolean;
  metricLabel?: string; // e.g. "Doanh thu"
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedIds,
  onChange,
  loading = false,
  metricLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleToggleAll = () => {
    if (selectedIds.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.id));
    }
  };

  const isAllSelected = selectedIds.length === options.length && options.length > 0;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < options.length;
  const hasMetrics = options.some(o => o.metric !== undefined && o.metric > 0);

  if (loading) {
    return (
      <div className="relative">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm">
          <div className="h-4 w-24 rounded bg-slate-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 shadow-sm transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate mr-2">
          {selectedIds.length === 0 
            ? 'Tất cả' 
            : selectedIds.length === options.length 
              ? 'Tất cả' 
              : `Đã chọn (${selectedIds.length})`}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 max-h-72 w-full min-w-[260px] overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          {/* Header with metric column label */}
          {hasMetrics && (
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
              <span className="text-xs font-semibold uppercase text-slate-500">{metricLabel || 'Doanh thu'}</span>
            </div>
          )}
          <div className="p-2">
            <label className="flex cursor-pointer items-center rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <div className="relative mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white">
                <input
                  type="checkbox"
                  className="absolute opacity-0 cursor-pointer w-full h-full"
                  checked={isAllSelected}
                  onChange={handleToggleAll}
                />
                {(isAllSelected || isIndeterminate) && (
                  <div className="flex h-full w-full items-center justify-center rounded bg-blue-500">
                    {isAllSelected ? <Check size={12} className="text-white" /> : <div className="w-2 h-0.5 bg-white rounded-full" />}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium flex-1">Chọn tất cả</span>
            </label>
            <div className="my-1 h-px bg-slate-200"></div>
            {options.map(option => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <label key={option.id} className="flex cursor-pointer items-center rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  <div className="relative mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-slate-300 bg-white">
                    <input
                      type="checkbox"
                      className="absolute opacity-0 cursor-pointer w-full h-full"
                      checked={isSelected}
                      onChange={() => handleToggleOption(option.id)}
                    />
                    {isSelected && (
                      <div className="flex h-full w-full items-center justify-center rounded bg-blue-500">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm">{option.label}</span>
                  {option.metric !== undefined && option.metric > 0 && (
                    <span className="ml-2 whitespace-nowrap text-xs font-medium text-slate-500">
                      {formatMetric(option.metric)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
