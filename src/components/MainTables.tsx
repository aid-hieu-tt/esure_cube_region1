import React, { useState } from 'react';
import { RegionData } from '../types';
import { cn, formatCurrency, formatPercent } from '../lib/utils';
import { PaginationFooter } from './PaginationFooter';

interface MainTablesProps {
  regions: RegionData[];
  highlightedRegion: string | null;
}

type SortField = 'name' | 'businessUnit' | 'salesNT' | 'salesNonNT' | 'target' | 'completionRate';
type SortOrder = 'asc' | 'desc';

export const MainTables: React.FC<MainTablesProps> = ({ regions, highlightedRegion }) => {
  const [sortField, setSortField] = useState<SortField>('completionRate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(0);

  const pageSize = 10;
  const totalPages = Math.ceil(regions.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRegions = [...regions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const pagedRegions = sortedRegions.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">↕</span>;
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden" id="main-table">
      <h3 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">Top 10 TLHT</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0a2342] text-white">
              <th 
                className="p-3 cursor-pointer hover:bg-blue-900 transition-colors"
                onClick={() => handleSort('name')}
              >
                Thành phố <SortIcon field="name" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-blue-900 transition-colors"
                onClick={() => handleSort('businessUnit')}
              >
                Sản phẩm <SortIcon field="businessUnit" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-blue-900 transition-colors text-right"
                onClick={() => handleSort('salesNT')}
              >
                Doanh số NT / tháng <SortIcon field="salesNT" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-blue-900 transition-colors text-right"
                onClick={() => handleSort('salesNonNT')}
              >
                Doanh số phi NT / tháng <SortIcon field="salesNonNT" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-blue-900 transition-colors text-right"
                onClick={() => handleSort('target')}
              >
                Chỉ tiêu tháng 10 <SortIcon field="target" />
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-blue-900 transition-colors text-right"
                onClick={() => handleSort('completionRate')}
              >
                Tỉ lệ hoàn thành <SortIcon field="completionRate" />
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedRegions.map((region) => {
              const isLowCompletion = region.completionRate < 50;
              const isHighlighted = highlightedRegion === region.name;
              
              return (
                <tr 
                  key={region.id} 
                  className={cn(
                    "border-b border-gray-100 transition-colors",
                    isHighlighted ? "bg-blue-100" : "even:bg-orange-50 odd:bg-white hover:bg-blue-50"
                  )}
                >
                  <td className="p-3 font-medium text-gray-800">{region.name}</td>
                  <td className="p-3 text-gray-700">{region.businessUnit}</td>
                  <td className="p-3 text-right">{formatCurrency(region.salesNT)}</td>
                  <td className="p-3 text-right">{formatCurrency(region.salesNonNT)}</td>
                  <td className="p-3 text-right">{formatCurrency(region.target)}</td>
                  <td className={cn(
                    "p-3 text-right",
                    isLowCompletion ? "text-red-500 font-bold" : "text-green-600 font-medium"
                  )}>
                    {formatPercent(region.completionRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationFooter 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
