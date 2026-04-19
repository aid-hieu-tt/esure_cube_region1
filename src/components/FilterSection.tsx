import React from 'react';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import type { FilterOption } from '../hooks/useCubeFilterOptions';

export interface FilterState {
  agencies: string[];
  products: string[];
  packages: string[];
  paymentStatuses: string[];
  durations: string[];
  providers: string[];
  partners: string[];
  branchCodes: string[];
}

interface FilterSectionProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  /** Dynamic options from Cube.js dimensions */
  cityOptions?: FilterOption[];
  productOptions?: FilterOption[];
  packageOptions?: FilterOption[];
  paymentStatusOptions?: FilterOption[];
  durationOptions?: FilterOption[];
  providerOptions?: FilterOption[];
  paymentMethodOptions?: FilterOption[];
  branchOptions?: FilterOption[];
  optionsLoading?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onChange,
  cityOptions = [],
  productOptions = [],
  packageOptions = [],
  paymentStatusOptions = [],
  durationOptions = [],
  providerOptions = [],
  paymentMethodOptions = [],
  branchOptions = [],
  optionsLoading = false,
}) => {
  const selectedFilterCount =
    filters.branchCodes.length +
    filters.paymentStatuses.length +
    filters.products.length +
    filters.durations.length +
    filters.providers.length +
    filters.partners.length;

  return (
    <section className="shadow-slate-200/70 backdrop-blur relative overflow-visible rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-md md:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="tracking-[0.22em] text-[11px] font-semibold uppercase text-slate-500">Bộ lọc</p>
          <h2 className="tracking-tight mt-1 text-base font-extrabold text-slate-900">Tinh chỉnh dữ liệu hiển thị</h2>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Chọn nhiều giá trị cho từng chiều dữ liệu để soi sâu theo nhu cầu.
          </p>
        </div>

        <div className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">
            {selectedFilterCount}
          </span>
          <span>tiêu chí đang chọn</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <MultiSelectDropdown
          label="Chi nhánh"
          options={branchOptions}
          selectedIds={filters.branchCodes}
          onChange={ids => {
            return onChange({ ...filters, branchCodes: ids });
          }}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Trạng thái TT"
          options={paymentStatusOptions}
          selectedIds={filters.paymentStatuses}
          onChange={ids => {
            return onChange({ ...filters, paymentStatuses: ids });
          }}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Sản phẩm"
          options={productOptions}
          selectedIds={filters.products}
          onChange={ids => {
            return onChange({ ...filters, products: ids });
          }}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Tên gói"
          options={packageOptions}
          selectedIds={filters.packages}
          onChange={ids => {
            return onChange({ ...filters, packages: ids });
          }}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Thời hạn"
          options={durationOptions}
          selectedIds={filters.durations}
          onChange={ids => {
            return onChange({ ...filters, durations: ids });
          }}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Nhà bảo hiểm"
          options={providerOptions}
          selectedIds={filters.providers}
          onChange={ids => {
            return onChange({ ...filters, providers: ids });
          }}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Thanh toán"
          options={paymentMethodOptions}
          selectedIds={filters.partners}
          onChange={ids => {
            return onChange({ ...filters, partners: ids });
          }}
          loading={optionsLoading}
        />
      </div>
    </section>
  );
};
