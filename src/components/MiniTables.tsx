import React, { useState } from 'react';
import { TopPerformerData, InactiveUnitData, ProviderDailyRevenue } from '../types';
import { PaginationFooter } from './PaginationFooter';
import { formatCurrency } from '../lib/utils';
import { ProviderRevenueChart } from './ProviderRevenueChart';
import { useCrossFilter } from '../context/CrossFilterContext';

interface MiniTablesProps {
  topPerformers: TopPerformerData[];
  inactiveUnits: InactiveUnitData[];
  providerDailyRevenue: ProviderDailyRevenue[];
  providerNames: string[];
}

export const MiniTables: React.FC<MiniTablesProps> = ({ topPerformers, inactiveUnits, providerDailyRevenue, providerNames }) => {
  const [topPage, setTopPage] = useState(0);
  const { filters, toggleFilter } = useCrossFilter();

  const filteredTop = React.useMemo(() => {
     let res = topPerformers;
     if (filters['branchCodes']) res = res.filter(r => r.region === filters['branchCodes']);
     if (filters['products']) res = res.filter(r => r.businessUnit === filters['products']);
     return res;
  }, [topPerformers, filters]);

  const pageSize = 10;
  
  const topTotalPages = Math.ceil(filteredTop.length / pageSize);
  const pagedTop = filteredTop.slice(topPage * pageSize, (topPage + 1) * pageSize);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Top 7 Doanh số */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#fcd5b4] text-center py-2 font-bold text-gray-900 border-b border-gray-300">
          Top 7 doanh số sản phẩm theo chi nhánh
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#002060] text-white">
            <tr>
              <th className="py-2 px-3 font-medium border-r border-white/20">Chi nhánh</th>
              <th className="py-2 px-3 font-medium border-r border-white/20">Tên gói</th>
              <th className="py-2 px-3 font-medium text-center">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {pagedTop.map((item, index) => {
              const isRegionSelected = filters['branchCodes'] === item.region;
              const isProductSelected = filters['products'] === item.businessUnit;
              return (
              <tr 
                key={item.id} 
                className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td 
                  className={`py-2 px-3 border-r border-gray-200 cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${isRegionSelected ? 'font-bold text-blue-800 bg-blue-50/50' : ''}`}
                  onClick={() => toggleFilter('branchCodes', item.region)}
                >
                  {item.region}
                </td>
                <td 
                  className={`py-2 px-3 border-r border-gray-200 cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${isProductSelected ? 'font-bold text-blue-800 bg-blue-50/50' : ''}`}
                  onClick={() => toggleFilter('packages', item.businessUnit)}
                >
                  {item.businessUnit}
                </td>
                <td className="py-2 px-3 text-center bg-[#fff3e0] font-medium">{formatCurrency(item.total)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
        <PaginationFooter 
          currentPage={topPage}
          totalPages={topTotalPages}
          onPageChange={setTopPage}
        />
      </div>

      {/* Line Chart: Doanh thu theo Nhà bảo hiểm */}
      <ProviderRevenueChart data={providerDailyRevenue} providerNames={providerNames} />
    </div>
  );
};
