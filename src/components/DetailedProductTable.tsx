import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { DetailedProductRow } from '../types';
import { formatCurrency } from '../lib/utils';
import { Search } from 'lucide-react';

interface DetailedProductTableProps {
  data: DetailedProductRow[];
  loading?: boolean;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export const DetailedProductTable: React.FC<DetailedProductTableProps> = ({ data, loading }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  const columns = useMemo(() => [
    { 
      header: 'Khu vực', 
      accessorKey: 'khuVuc',
      cell: (info: any) => {
        // Simple row spanning logic: only show if it's the first in the group
        // For a real app, we'd use TanStack Table's grouping feature, but for this UI
        // we can just check the previous row if it's sorted by khuVuc.
        // Since we want simple grouping visually:
        return <span className="font-medium text-gray-900">{info.getValue()}</span>;
      }
    },
    { 
      header: 'ĐVKD', 
      accessorKey: 'dvkd',
      cell: (info: any) => <span className="font-medium text-gray-700">{info.getValue()}</span>
    },
    { header: 'Đối tác', accessorKey: 'doiTac' },
    { header: 'Sản phẩm', accessorKey: 'sanPham' },
    { 
      header: 'Active', 
      accessorKey: 'isActive',
      cell: (info: any) => info.getValue() 
        ? <div className="flex items-center gap-1 text-green-600 font-medium"><span className="text-lg leading-none">●</span> Active</div> 
        : <div className="flex items-center gap-1 text-red-600 font-medium"><span className="text-lg leading-none">○</span> Inactive</div>
    },
    { 
      header: 'SL Bán', 
      accessorKey: 'slBan',
      cell: (info: any) => <span className="text-gray-900">{info.getValue()}</span>
    },
    { 
      header: 'Case Size', 
      accessorKey: 'caseSize',
      cell: (info: any) => <span className="text-gray-900">{new Intl.NumberFormat('vi-VN').format(info.getValue())}</span>
    },
    { 
      header: 'Tổng Doanh Thu', 
      accessorKey: 'tongDT',
      cell: (info: any) => <span className="font-bold text-blue-900">{formatCurrency(info.getValue())}</span>
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: debouncedGlobalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Helper to determine if we should hide the cell content for row spanning
  // This works best when sorted by Khu Vuc and DVKD
  const rows = table.getRowModel().rows;

  return (
    <div className="w-full mb-6 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
        <h3 className="text-lg font-bold text-blue-900">Chi tiết Sản phẩm & Đối tác</h3>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Tìm kiếm đối tác, ĐVKD..."
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-[#0a2342] text-white">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className={`p-3 font-semibold border-r border-white/10 last:border-r-0 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-white/10' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              // Skeleton Loading
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {columns.map((_, j) => (
                    <td key={j} className="p-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length > 0 ? (
              rows.map((row, index) => {
                // Row spanning logic
                const prevRow = index > 0 ? rows[index - 1] : null;
                const showKhuVuc = !prevRow || prevRow.getValue('khuVuc') !== row.getValue('khuVuc');
                const showDvkd = showKhuVuc || !prevRow || prevRow.getValue('dvkd') !== row.getValue('dvkd');

                return (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-yellow-50 transition-colors">
                    {row.getVisibleCells().map(cell => {
                      const isKhuVuc = cell.column.id === 'khuVuc';
                      const isDvkd = cell.column.id === 'dvkd';
                      
                      let content = flexRender(cell.column.columnDef.cell, cell.getContext());
                      
                      // Apply row spanning visually by hiding text and removing top border if it's the same as previous
                      if (isKhuVuc && !showKhuVuc) content = null;
                      if (isDvkd && !showDvkd) content = null;

                      return (
                        <td 
                          key={cell.id} 
                          className={`p-3 border-r border-gray-200 last:border-r-0 ${(!showKhuVuc && isKhuVuc) || (!showDvkd && isDvkd) ? 'border-t-0' : ''}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                  Không tìm thấy dữ liệu phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
