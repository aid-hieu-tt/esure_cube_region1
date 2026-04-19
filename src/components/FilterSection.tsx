import React from 'react';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import type { FilterOption } from '../hooks/useCubeFilterOptions';

export interface FilterState {
  agencies: string[];
  products: string[];
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
  paymentStatusOptions = [],
  durationOptions = [],
  providerOptions = [],
  paymentMethodOptions = [],
  branchOptions = [],
  optionsLoading = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">

        <MultiSelectDropdown
          label="Chi nhánh"
          options={branchOptions}
          selectedIds={filters.branchCodes}
          onChange={(ids) => onChange({ ...filters, branchCodes: ids })}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Trạng thái TT"
          options={paymentStatusOptions}
          selectedIds={filters.paymentStatuses}
          onChange={(ids) => onChange({ ...filters, paymentStatuses: ids })}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Sản phẩm"
          options={productOptions}
          selectedIds={filters.products}
          onChange={(ids) => onChange({ ...filters, products: ids })}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Thời hạn"
          options={durationOptions}
          selectedIds={filters.durations}
          onChange={(ids) => onChange({ ...filters, durations: ids })}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Nhà bảo hiểm"
          options={providerOptions}
          selectedIds={filters.providers}
          onChange={(ids) => onChange({ ...filters, providers: ids })}
          loading={optionsLoading}
        />
        <MultiSelectDropdown
          label="Thanh toán"
          options={paymentMethodOptions}
          selectedIds={filters.partners}
          onChange={(ids) => onChange({ ...filters, partners: ids })}
          loading={optionsLoading}
        />
      </div>
    </div>
  );
};
