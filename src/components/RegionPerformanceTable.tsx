import React, { useState } from 'react';
import { useCrossFilter } from '../context/CrossFilterContext';
import { formatCurrency } from '../lib/utils';
import { RegionPerformanceData } from '../types';
import { PaginationFooter } from './PaginationFooter';

interface RegionPerformanceTableProps {
  data: RegionPerformanceData[];
}

export const RegionPerformanceTable: React.FC<RegionPerformanceTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { filters, toggleFilter } = useCrossFilter();
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    let result = data;
    if (filters['branchCodes']) {
      result = result.filter(r => {
        return r.region === filters['branchCodes'];
      });
    }
    return result;
  }, [data, filters]);

  if (filteredData.length === 0) {
    return null;
  }

  const pageSize = 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const getCompletionColor = (rate: number) => {
    if (rate >= 100) {
      return 'text-green-600 bg-green-50';
    }
    if (rate >= 70) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-red-600 bg-red-50';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') {
      return <span className="text-green-500">▲</span>;
    }
    if (trend === 'down') {
      return <span className="text-red-500">▼</span>;
    }
    return <span className="text-gray-400">−</span>;
  };

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="tracking-wide text-sm font-bold uppercase text-gray-800">Hiệu suất theo Chi nhánh</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-600">Chi nhánh</th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-600">DS ngày</th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-600">DS tháng</th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-600">Chỉ tiêu</th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-gray-600">Hoàn thành</th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-600">Case Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentData.map(row => {
              const isSelected = filters['branchCodes'] === row.region;
              return (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-blue-50/20 ${isSelected ? 'border-l-4 border-l-blue-600 bg-blue-50/40' : 'border-l-4 border-l-transparent'}`}
                >
                  <td
                    className="decoration-blue-700 underline-offset-2 cursor-pointer px-4 py-3 font-medium text-gray-800 hover:text-blue-700 hover:underline"
                    onClick={() => {
                      return toggleFilter('branchCodes', row.region);
                    }}
                  >
                    {row.region}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.dailySales)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {formatCurrency(row.monthlySales)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(row.target)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${getCompletionColor(row.completionRate)}`}
                    >
                      {row.completionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(row.caseSize)} {getTrendIcon(row.caseSizeTrend)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationFooter currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </section>
  );
};

export default RegionPerformanceTable;
