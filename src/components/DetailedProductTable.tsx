import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../lib/utils';
import { DetailedProductRow } from '../types';

interface DetailedProductTableProps {
  data: DetailedProductRow[];
  loading?: boolean;
}

const useDebounce = <T,>(value: T, delay: number): T => {
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
};

export const DetailedProductTable: React.FC<DetailedProductTableProps> = ({ data, loading }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  const columns = useMemo(() => {
    return [
      {
        header: 'Khu vực',
        accessorKey: 'khuVuc',
        cell: (info: { getValue: () => string }) => {
          return <span className="font-medium text-gray-900">{info.getValue()}</span>;
        },
      },
      {
        header: 'ĐVKD',
        accessorKey: 'dvkd',
        cell: (info: { getValue: () => string }) => {
          return <span className="font-medium text-gray-700">{info.getValue()}</span>;
        },
      },
      { header: 'Đối tác', accessorKey: 'doiTac' },
      { header: 'Sản phẩm', accessorKey: 'sanPham' },
      {
        header: 'Active',
        accessorKey: 'isActive',
        cell: (info: { getValue: () => boolean }) => {
          return info.getValue() ? (
            <div className="flex items-center gap-1 font-medium text-green-600">
              <span className="text-lg leading-none">●</span> Active
            </div>
          ) : (
            <div className="flex items-center gap-1 font-medium text-red-600">
              <span className="text-lg leading-none">○</span> Inactive
            </div>
          );
        },
      },
      {
        header: 'SL Bán',
        accessorKey: 'slBan',
        cell: (info: { getValue: () => number }) => {
          return <span className="text-gray-900">{info.getValue()}</span>;
        },
      },
      {
        header: 'Case Size',
        accessorKey: 'caseSize',
        cell: (info: { getValue: () => number }) => {
          return <span className="text-gray-900">{new Intl.NumberFormat('vi-VN').format(info.getValue())}</span>;
        },
      },
      {
        header: 'Tổng Doanh Thu',
        accessorKey: 'tongDT',
        cell: (info: { getValue: () => number }) => {
          return <span className="font-bold text-blue-900">{formatCurrency(info.getValue())}</span>;
        },
      },
    ];
  }, []);

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

  const rows = table.getRowModel().rows;

  return (
    <div className="mb-6 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
        <h3 className="text-lg font-bold text-blue-900">Chi tiết Sản phẩm & Đối tác</h3>
        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="size-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={globalFilter}
            onChange={event => {
              return setGlobalFilter(event.target.value);
            }}
            className="focus:outline-none focus:ring-1 focus:ring-blue-500 block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder:text-gray-500 focus:border-blue-500 focus:placeholder:text-gray-400 sm:text-sm"
            placeholder="Tìm kiếm đối tác, ĐVKD..."
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse w-full text-left text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => {
              return (
                <tr key={headerGroup.id} className="bg-[#0a2342] text-white">
                  {headerGroup.headers.map(header => {
                    return (
                      <th
                        key={header.id}
                        className={`border-r border-white/10 p-3 font-semibold last:border-r-0 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-white/10' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => {
                return (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {columns.map((_, colIndex) => {
                      return (
                        <td key={colIndex} className="p-3">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : rows.length > 0 ? (
              rows.map((row, index) => {
                const prevRow = index > 0 ? rows[index - 1] : null;
                const showKhuVuc = !prevRow || prevRow.getValue('khuVuc') !== row.getValue('khuVuc');
                const showDvkd = showKhuVuc || !prevRow || prevRow.getValue('dvkd') !== row.getValue('dvkd');

                return (
                  <tr key={row.id} className="border-b border-gray-200 transition-colors hover:bg-yellow-50">
                    {row.getVisibleCells().map(cell => {
                      const isKhuVuc = cell.column.id === 'khuVuc';
                      const isDvkd = cell.column.id === 'dvkd';
                      let content = flexRender(cell.column.columnDef.cell, cell.getContext());

                      if (isKhuVuc && !showKhuVuc) {
                        content = null;
                      }
                      if (isDvkd && !showDvkd) {
                        content = null;
                      }

                      return (
                        <td
                          key={cell.id}
                          className={`border-r border-gray-200 p-3 last:border-r-0 ${(!showKhuVuc && isKhuVuc) || (!showDvkd && isDvkd) ? 'border-t-0' : ''}`}
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
