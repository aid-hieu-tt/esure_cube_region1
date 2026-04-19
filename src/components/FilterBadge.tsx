import { X, Filter } from 'lucide-react';
import React from 'react';
import { useCrossFilter } from '../context/CrossFilterContext';

export const FilterBadge: React.FC = () => {
  const { filters, clearFilter, clearAllFilters, hasAnyFilter } = useCrossFilter();

  const labels: Record<string, string> = {
    regionCodes: 'Vùng',
    branchCodes: 'Chi nhánh',
    paymentStatuses: 'Trạng thái TT',
    products: 'Sản phẩm',
    packages: 'Tên gói',
    durations: 'Thời hạn',
    providers: 'Nhà bảo hiểm',
    paymentMethod: 'Thanh toán',
  };

  if (!hasAnyFilter) {
    return null;
  }

  return (
    <div className="mb-1 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-3 shadow-sm transition-all duration-300">
      <div className="mr-1 flex items-center whitespace-nowrap font-semibold text-blue-700">
        <Filter className="mr-2 size-4" />
        Đang lọc theo:
      </div>
      <div className="flex grow flex-wrap gap-2">
        {Object.entries(filters).map(([dimension, value]) => {
          if (!value) {
            return null;
          }
          return (
            <div
              key={dimension}
              className="group flex items-center rounded-lg border border-blue-300/60 bg-white px-3 py-1.5 text-sm text-blue-800 shadow-sm transition-all hover:border-blue-400 hover:shadow"
            >
              <span className="mr-1 font-semibold">{labels[dimension] || dimension}:</span>
              <span className="font-bold">{value}</span>
              <button
                onClick={() => {
                  return clearFilter(dimension);
                }}
                className="focus:outline-none ml-2 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                title={`Xóa bộ lọc ${dimension}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      {Object.keys(filters).filter(k => {
        return filters[k];
      }).length > 1 && (
        <button
          onClick={clearAllFilters}
          className="whitespace-nowrap rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );
};
