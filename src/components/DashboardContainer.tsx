import React, { useState } from 'react';
import { useFetchDashboardData } from '../hooks/useFetchDashboardData';
import { useCubeFilterOptions } from '../hooks/useCubeFilterOptions';
import { Header } from './Header';
import { FilterSection, FilterState } from './FilterSection';
import { KPISection } from './KPISection';
import { MiniTables } from './MiniTables';
import { DashboardPieCharts } from './DashboardPieCharts';
import PartnerDetailTable from './PartnerDetailTable';
import { ChartsSection } from './ChartsSection';
import { RegionPerformanceTable } from './RegionPerformanceTable';
import RightDrawer from './Drawer';
import TargetSetupForm from './TargetSetupForm';
import { DateRangeValue } from './LookerDateRangePicker';
import { CrossFilterProvider, useCrossFilter } from '../context/CrossFilterContext';
import { FilterBadge } from './FilterBadge';

function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRangeValue>('This month');
  const [filters, setFilters] = useState<FilterState>({
    agencies: [], products: [], paymentStatuses: [], packages: [], durations: [], providers: [], partners: [], branchCodes: []
  });

  const { filters: crossFilters } = useCrossFilter();
  const { data, loading, refreshing, error } = useFetchDashboardData(dateRange, filters, crossFilters);
  const filterOptions = useCubeFilterOptions(dateRange);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
        <div className="text-red-500 font-medium">{error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] p-4 md:p-6 lg:p-8 relative">
      <div className="max-w-7xl mx-auto">
        <Header onOpenSettings={() => setIsSettingOpen(true)} dateValue={dateRange} onDateChange={setDateRange} />
        <FilterSection filters={filters} onChange={setFilters} cityOptions={filterOptions.cities} paymentStatusOptions={filterOptions.paymentStatuses} productOptions={filterOptions.productOptions} packageOptions={filterOptions.packageOptions} durationOptions={filterOptions.durations} providerOptions={filterOptions.providers} paymentMethodOptions={filterOptions.paymentMethods} branchOptions={filterOptions.branches} optionsLoading={filterOptions.loading} />
        <FilterBadge />
        <KPISection kpis={data.kpis} />
        <ChartsSection timeTracking={data.timeTracking} regions={data.regions} />
        <RegionPerformanceTable data={data.regionPerformance} />
        <MiniTables topPerformers={data.topPerformers} inactiveUnits={data.inactiveUnits} providerDailyRevenue={data.providerDailyRevenue} providerNames={data.providerNames} />
        <DashboardPieCharts pieCharts={data.pieCharts} />
        <PartnerDetailTable data={data.partnerDetails} />
      </div>

      <RightDrawer isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)} title="Cài đặt hệ thống">
        <TargetSetupForm onSaved={() => setIsSettingOpen(false)} cityOptions={filterOptions.branches} />
      </RightDrawer>
    </main>
  );
}

export const DashboardContainer: React.FC = () => {
  return (
    <CrossFilterProvider>
      <DashboardContent />
    </CrossFilterProvider>
  );
};
