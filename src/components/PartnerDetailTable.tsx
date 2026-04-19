import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useCrossFilter } from '../context/CrossFilterContext';
import { formatCurrency } from '../lib/utils';
import { PartnerDetailRow } from '../types';
import { PaginationFooter } from './PaginationFooter';

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
    if (filters['branchCodes']) {
      result = result.filter(r => {
        return r.chiNhanh === filters['branchCodes'];
      });
    }

    if (filters['products']) {
      result = result.filter(r => {
        return r.sanPham === filters['products'];
      });
    }
    if (filters['packages']) {
      result = result.filter(r => {
        return r.tenGoi === filters['packages'];
      });
    }
    if (filters['providers']) {
      result = result.filter(r => {
        return r.nhaBaoHiem === filters['providers'];
      });
    }
    if (filters['paymentMethod']) {
      result = result.filter(r => {
        return r.phuongThucThanhToan === filters['paymentMethod'];
      });
    }

    if (!globalFilter) {
      return result;
    }
    const lowerFilter = globalFilter.toLowerCase();

    return result.filter(row => {
      return (
        row.chiNhanh?.toLowerCase().includes(lowerFilter) ||
        row.sanPham?.toLowerCase().includes(lowerFilter) ||
        row.tenGoi?.toLowerCase().includes(lowerFilter) ||
        row.nhaBaoHiem?.toLowerCase().includes(lowerFilter) ||
        row.partnerName?.toLowerCase().includes(lowerFilter)
      );
    });
  }, [data, globalFilter, filters]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('chiNhanh', {
        id: 'chiNhanh',
        header: 'Chi nhánh',
        cell: info => {
          return (
            <span
              className="decoration-emerald-700 underline-offset-2 cursor-pointer font-semibold text-emerald-700 hover:underline"
              onClick={() => {
                return toggleFilter('branchCodes', info.getValue());
              }}
            >
              {info.getValue()}
            </span>
          );
        },
      }),

      columnHelper.accessor('sanPham', {
        header: 'Sản phẩm',
        cell: info => {
          return (
            <span
              className="decoration-gray-700 underline-offset-2 cursor-pointer text-gray-700 hover:underline"
              onClick={() => {
                return toggleFilter('products', info.getValue());
              }}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor('tenGoi', {
        header: 'Tên gói',
        cell: info => {
          return (
            <span
              className="decoration-gray-700 underline-offset-2 cursor-pointer font-medium text-gray-700 hover:underline"
              onClick={() => {
                return toggleFilter('packages', info.getValue());
              }}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor('thoiHan', {
        header: 'Thời hạn',
        cell: info => {
          return (
            <span
              className="decoration-gray-700 underline-offset-2 cursor-pointer text-gray-700 hover:underline"
              onClick={() => {
                return toggleFilter('durations', info.getValue());
              }}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor('nhaBaoHiem', {
        header: 'Nhà bảo hiểm',
        cell: info => {
          return (
            <span
              className="decoration-blue-800 underline-offset-2 cursor-pointer font-semibold text-blue-800 hover:underline"
              onClick={() => {
                return toggleFilter('providers', info.getValue());
              }}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor('phuongThucThanhToan', {
        header: 'Thanh toán',
        cell: info => {
          return (
            <span
              className="decoration-gray-700 underline-offset-2 cursor-pointer text-gray-700 hover:underline"
              onClick={() => {
                return toggleFilter('paymentMethod', info.getValue());
              }}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Trạng thái TT',
        cell: info => {
          const val = info.getValue();
          const color =
            val === 'Completed'
              ? 'text-green-700 bg-green-100'
              : val === 'Pending'
                ? 'text-yellow-700 bg-yellow-100'
                : 'text-red-700 bg-red-100';
          return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>{val}</span>;
        },
      }),
      columnHelper.accessor('quantity', {
        header: 'SL Bán',
        cell: info => {
          return <span className="font-medium text-gray-700">{info.getValue()}</span>;
        },
      }),
      columnHelper.accessor('tongDoanhThu', {
        header: 'Tổng Doanh Thu',
        cell: info => {
          return <span className="font-bold text-blue-900">{formatCurrency(info.getValue())}</span>;
        },
      }),
    ];
  }, [toggleFilter]);

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
    <div className="shadow-slate-200/70 relative mb-1 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-br from-slate-50/80 via-white/60 to-blue-50/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="tracking-[0.22em] text-[11px] font-semibold uppercase text-slate-500">Chi tiết</p>
          <h3 className="tracking-tight mt-1 text-base font-extrabold text-slate-900">Sản phẩm & đối tác</h3>
          <p className="mt-1 text-xs font-medium text-slate-600">Tìm nhanh theo chi nhánh, sản phẩm, đối tác...</p>
        </div>

        <label className="relative w-full sm:w-[420px]">
          <span className="sr-only">Tìm kiếm</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={event => {
              return setGlobalFilter(event.target.value);
            }}
            placeholder="Tìm kiếm trong bảng..."
            className="outline-none ring-blue-500/0 focus:ring-4 w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 shadow-sm transition focus:border-blue-300"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse w-full text-left text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => {
              return (
                <tr key={headerGroup.id} className="bg-slate-800 text-white">
                  {headerGroup.headers.map(header => {
                    return (
                      <th
                        key={header.id}
                        className="cursor-pointer select-none border-r border-white/10 p-3 font-semibold transition-colors last:border-r-0 hover:bg-slate-700"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="size-3.5 text-yellow-300" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="size-3.5 text-yellow-300" />
                          ) : (
                            <ArrowUpDown className="size-3.5 text-white/40" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => {
              return (
                <tr
                  key={row.id}
                  className={`border-t border-slate-200 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                >
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id} className="border-r border-slate-100 p-3 last:border-r-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
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
