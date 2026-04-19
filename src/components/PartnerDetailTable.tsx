import React, { useEffect, useMemo, useState } from 'react';
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
    if (filters['packages']) result = result.filter(r => r.tenGoi === filters['packages']);
    if (filters['providers']) result = result.filter(r => r.nhaBaoHiem === filters['providers']);
    if (filters['paymentMethod']) result = result.filter(r => r.phuongThucThanhToan === filters['paymentMethod']);

    if (!globalFilter) return result;
    const lowerFilter = globalFilter.toLowerCase();
    
    return result.filter(row => 
      row.chiNhanh?.toLowerCase().includes(lowerFilter) ||

      row.sanPham?.toLowerCase().includes(lowerFilter) ||
      row.tenGoi?.toLowerCase().includes(lowerFilter) ||
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
    columnHelper.accessor('tenGoi', {
      header: 'Tên gói',
      cell: info => <span className="text-gray-700 cursor-pointer hover:underline decoration-gray-700 underline-offset-2 font-medium" onClick={() => toggleFilter('packages', info.getValue())}>{info.getValue()}</span>,
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

  useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter]);

  return (
    <div className="relative mb-1 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-200/70">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-br from-slate-50/80 via-white/60 to-blue-50/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Chi tiết</p>
          <h3 className="mt-1 text-base font-extrabold tracking-tight text-slate-900">Sản phẩm & đối tác</h3>
          <p className="mt-1 text-xs font-medium text-slate-600">Tìm nhanh theo chi nhánh, sản phẩm, đối tác...</p>
        </div>

        <label className="relative w-full sm:w-[420px]">
          <span className="sr-only">Tìm kiếm</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Tìm kiếm trong bảng..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 shadow-sm outline-none ring-blue-500/0 transition focus:border-blue-300 focus:ring-4"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-slate-800 text-white">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="cursor-pointer select-none border-r border-white/10 p-3 font-semibold transition-colors last:border-r-0 hover:bg-slate-700"
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
                  className={`border-t border-slate-200 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="border-r border-slate-100 p-3 last:border-r-0"
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
