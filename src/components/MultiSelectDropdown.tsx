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
        <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
        <div className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <span className="truncate mr-2">
          {selectedIds.length === 0 
            ? 'Tất cả' 
            : selectedIds.length === options.length 
              ? 'Tất cả' 
              : `Đã chọn (${selectedIds.length})`}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full min-w-[260px] bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto">
          {/* Header with metric column label */}
          {hasMetrics && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
              <span className="text-xs font-semibold text-gray-500 uppercase">Doanh thu</span>
            </div>
          )}
          <div className="p-2">
            <label className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded">
              <div className="relative flex items-center justify-center w-4 h-4 mr-2 border border-gray-300 rounded bg-white flex-shrink-0">
                <input
                  type="checkbox"
                  className="absolute opacity-0 cursor-pointer w-full h-full"
                  checked={isAllSelected}
                  onChange={handleToggleAll}
                />
                {(isAllSelected || isIndeterminate) && (
                  <div className={`w-full h-full flex items-center justify-center rounded bg-blue-500`}>
                    {isAllSelected ? <Check size={12} className="text-white" /> : <div className="w-2 h-0.5 bg-white rounded-full" />}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium flex-1">Chọn tất cả</span>
            </label>
            <div className="h-px bg-gray-200 my-1"></div>
            {options.map(option => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <label key={option.id} className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded">
                  <div className="relative flex items-center justify-center w-4 h-4 mr-2 border border-gray-300 rounded bg-white flex-shrink-0">
                    <input
                      type="checkbox"
                      className="absolute opacity-0 cursor-pointer w-full h-full"
                      checked={isSelected}
                      onChange={() => handleToggleOption(option.id)}
                    />
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center rounded bg-blue-500">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm flex-1 truncate">{option.label}</span>
                  {option.metric !== undefined && option.metric > 0 && (
                    <span className="text-xs text-gray-500 font-medium ml-2 whitespace-nowrap">
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
