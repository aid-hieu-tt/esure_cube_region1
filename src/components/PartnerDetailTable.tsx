import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { PartnerDetailRow } from '../types';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PaginationFooter } from './PaginationFooter';
import { formatCurrency } from '../lib/utils';
import { useCrossFilter } from '../context/CrossFilterContext';

const columnHelper = createColumnHelper<PartnerDetailRow>();

interface PartnerDetailTableProps {
  data: PartnerDetailRow[];
}

export default function PartnerDetailTable({ data }: PartnerDetailTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const { filters, toggleFilter } = useCrossFilter();

  const filteredData = useMemo(() => {
    let result = data;
    
    // Cross-filtering constraints
    if (filters['branchCodes']) result = result.filter(r => r.chiNhanh === filters['branchCodes']);

    if (filters['products']) result = result.filter(r => r.sanPham === filters['products']);
    if (filters['providers']) result = result.filter(r => r.nhaBaoHiem === filters['providers']);
    if (filters['paymentMethod']) result = result.filter(r => r.phuongThucThanhToan === filters['paymentMethod']);

    if (!globalFilter) return result;
    const lowerFilter = globalFilter.toLowerCase();
    
    return result.filter(row => 
      row.chiNhanh?.toLowerCase().includes(lowerFilter) ||

      row.sanPham?.toLowerCase().includes(lowerFilter) ||
      row.nhaBaoHiem?.toLowerCase().includes(lowerFilter) ||
      row.partnerName?.toLowerCase().includes(lowerFilter)
    );
  }, [data, globalFilter, filters]);

  const columns = useMemo(() => [
    columnHelper.accessor('chiNhanh', {
      id: 'chiNhanh',
      header: 'Chi nhánh',
      cell: info => <span className="font-semibold text-emerald-700 cursor-pointer hover:underline decoration-emerald-700 underline-offset-2" onClick={() => toggleFilter('branchCodes', info.getValue())}>{info.getValue()}</span>,
    }),

    columnHelper.accessor('sanPham', {
      header: 'Sản phẩm',
      cell: info => <span className="text-gray-700 cursor-pointer hover:underline decoration-gray-700 underline-offset-2" onClick={() => toggleFilter('products', info.getValue())}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('thoiHan', {
      header: 'Thời hạn',
      cell: info => <span className="text-gray-700 cursor-pointer hover:underline decoration-gray-700 underline-offset-2" onClick={() => toggleFilter('durations', info.getValue())}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('nhaBaoHiem', {
      header: 'Nhà bảo hiểm',
      cell: info => <span className="font-semibold text-blue-800 cursor-pointer hover:underline decoration-blue-800 underline-offset-2" onClick={() => toggleFilter('providers', info.getValue())}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('phuongThucThanhToan', {
      header: 'Thanh toán',
      cell: info => <span className="text-gray-700 cursor-pointer hover:underline decoration-gray-700 underline-offset-2" onClick={() => toggleFilter('paymentMethod', info.getValue())}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('paymentStatus', {
      header: 'Trạng thái TT',
      cell: info => {
        const val = info.getValue();
        const color = val === 'Completed' ? 'text-green-700 bg-green-100' : val === 'Pending' ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{val}</span>;
      },
    }),
    columnHelper.accessor('quantity', {
      header: 'SL Bán',
      cell: info => <span className="font-medium text-gray-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor('tongDoanhThu', {
      header: 'Tổng Doanh Thu',
      cell: info => <span className="font-bold text-blue-900">{formatCurrency(info.getValue())}</span>,
    }),
  ], [toggleFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  return (
    <div className="w-full mb-6 bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200 gap-4">
        <h3 className="text-lg font-bold text-[#002060]">Chi tiết Sản phẩm &amp; Đối tác</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-[#0a2342] text-white">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="p-3 font-bold border-r border-white/10 last:border-r-0 cursor-pointer select-none hover:bg-[#163a6a] transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-yellow-300" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-yellow-300" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => {
              return (
                <tr 
                  key={row.id} 
                  className={`bg-white hover:bg-gray-50 border-t border-gray-200`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="p-3 border-r border-gray-100 last:border-r-0"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationFooter 
        currentPage={table.getState().pagination.pageIndex}
        totalPages={table.getPageCount()}
        onPageChange={table.setPageIndex}
      />
    </div>
  );
}
