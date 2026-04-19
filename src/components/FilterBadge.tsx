import React from 'react';
import { useCrossFilter } from '../context/CrossFilterContext';
import { X, Filter } from 'lucide-react';

export const FilterBadge: React.FC = () => {
  const { filters, clearFilter, clearAllFilters, hasAnyFilter } = useCrossFilter();

  const labels: Record<string, string> = {
    regionCodes: 'Vùng',
    branchCodes: 'Chi nhánh',
    paymentStatuses: 'Trạng thái TT',
    products: 'Sản phẩm',
    durations: 'Thời hạn',
    providers: 'Nhà bảo hiểm',
    paymentMethod: 'Thanh toán'
  };

  if (!hasAnyFilter) return null;

  return (
    <div className="flex items-center space-x-3 mb-6 p-3 bg-blue-50/80 border border-blue-200 rounded-lg shadow-sm transition-all duration-300 transform origin-top animate-in slide-in-from-top-4 fade-in">
      <div className="flex items-center text-blue-700 font-semibold mr-2 whitespace-nowrap">
        <Filter className="w-4 h-4 mr-2" />
        Đang lọc theo:
      </div>
      <div className="flex flex-wrap gap-2 flex-grow">
        {Object.entries(filters).map(([dimension, value]) => {
          if (!value) return null;
          return (
            <div 
              key={dimension} 
              className="group flex items-center bg-white border border-blue-300/60 text-blue-800 px-3 py-1.5 rounded-md text-sm shadow-sm transition-all hover:border-blue-400 hover:shadow"
            >
              <span className="font-semibold mr-1">{labels[dimension] || dimension}:</span>
              <span className="font-bold">{value}</span>
              <button 
                onClick={() => clearFilter(dimension)}
                className="ml-2 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full p-0.5 transition-colors focus:outline-none"
                title={`Xóa bộ lọc ${dimension}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      {Object.keys(filters).filter(k => filters[k]).length > 1 && (
        <button 
          onClick={clearAllFilters}
          className="text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-1.5 border border-transparent hover:bg-red-50 hover:border-red-200 rounded-md transition-all whitespace-nowrap"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
};
