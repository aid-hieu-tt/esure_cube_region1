import React, { useState } from 'react';
import { CrossFilterProvider, useCrossFilter } from '../context/CrossFilterContext';
import { useCubeFilterOptions } from '../hooks/useCubeFilterOptions';
import { useFetchDashboardData } from '../hooks/useFetchDashboardData';
import { ChartsSection } from './ChartsSection';
import { DashboardPieCharts } from './DashboardPieCharts';
import RightDrawer from './Drawer';
import { FilterBadge } from './FilterBadge';
import { FilterSection, FilterState } from './FilterSection';
import { Header } from './Header';
import { KPISection } from './KPISection';
import { DateRangeValue } from './LookerDateRangePicker';
import { MiniTables } from './MiniTables';
import PartnerDetailTable from './PartnerDetailTable';
import { RegionPerformanceTable } from './RegionPerformanceTable';
import TargetSetupForm from './TargetSetupForm';

interface DashboardSectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ eyebrow, title, description, children }) => {
  return (
    <section className="shadow-slate-200/60 backdrop-blur rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="tracking-[0.22em] text-[11px] font-semibold uppercase text-slate-500">{eyebrow}</p>
          <h2 className="tracking-tight mt-1 text-lg font-extrabold text-slate-900 md:text-xl">{title}</h2>
          {description ? <p className="mt-1 max-w-3xl text-sm font-medium text-slate-600">{description}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
};

function DashboardContent() {
  const [dateRange, setDateRange] = useState<DateRangeValue>('This month');
  const [filters, setFilters] = useState<FilterState>({
    agencies: [],
    products: [],
    paymentStatuses: [],
    packages: [],
    durations: [],
    providers: [],
    partners: [],
    branchCodes: [],
  });

  const { filters: crossFilters } = useCrossFilter();
  const { data, loading, refreshing, error } = useFetchDashboardData(dateRange, filters, crossFilters);
  const filterOptions = useCubeFilterOptions(dateRange);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
        <div className="gs-grid pointer-events-none absolute inset-0" />
        <div className="gs-noise pointer-events-none absolute inset-0" />
        <div className="shadow-slate-200/70 backdrop-blur relative flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-8 py-7 shadow-lg">
          <div className="size-12 animate-spin rounded-full border-2 border-blue-200 border-b-blue-700" />
          <p className="text-sm font-semibold text-slate-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-4">
        <div className="gs-grid pointer-events-none absolute inset-0" />
        <div className="gs-noise pointer-events-none absolute inset-0" />
        <div className="shadow-slate-200/70 backdrop-blur relative max-w-lg rounded-3xl border border-red-200/80 bg-white/80 px-6 py-5 text-sm font-semibold text-red-700 shadow-lg">
          {error || 'No data available'}
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-5 md:px-6 md:py-7 lg:p-8">
      <div className="gs-grid pointer-events-none absolute inset-0" />
      <div className="gs-noise pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200/35 via-indigo-200/25 to-cyan-200/25 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-5">
        <Header
          onOpenSettings={() => {
            return setIsSettingOpen(true);
          }}
          dateValue={dateRange}
          onDateChange={setDateRange}
        />
        <FilterSection
          filters={filters}
          onChange={setFilters}
          cityOptions={filterOptions.cities}
          paymentStatusOptions={filterOptions.paymentStatuses}
          productOptions={filterOptions.productOptions}
          packageOptions={filterOptions.packageOptions}
          durationOptions={filterOptions.durations}
          providerOptions={filterOptions.providers}
          paymentMethodOptions={filterOptions.paymentMethods}
          branchOptions={filterOptions.branches}
          optionsLoading={filterOptions.loading}
        />
        <FilterBadge />

        <DashboardSection
          eyebrow="Tổng quan"
          title="Chỉ số & xu hướng nhanh"
          description="Theo dõi KPI trọng yếu và biểu đồ tổng quan để nắm tiến độ trong một nhìn."
        >
          <KPISection kpis={data.kpis} />
          <ChartsSection timeTracking={data.timeTracking} regions={data.regions} />
        </DashboardSection>

        <DashboardSection
          eyebrow="Hiệu suất"
          title="Vùng & đơn vị"
          description="So sánh hiệu suất theo vùng, top sản phẩm và dòng doanh thu theo nhà bảo hiểm."
        >
          <RegionPerformanceTable data={data.regionPerformance} />
          <MiniTables
            topPerformers={data.topPerformers}
            inactiveUnits={data.inactiveUnits}
            providerDailyRevenue={data.providerDailyRevenue}
            providerNames={data.providerNames}
          />
        </DashboardSection>

        <DashboardSection
          eyebrow="Phân rã"
          title="Cơ cấu & chi tiết"
          description="Phân bổ theo ngành hàng, thời hạn, nhà bảo hiểm, phương thức thanh toán và bảng chi tiết đối tác."
        >
          <DashboardPieCharts pieCharts={data.pieCharts} />
          <PartnerDetailTable data={data.partnerDetails} />
        </DashboardSection>
      </div>

      {refreshing ? (
        <div className="shadow-slate-200/70 backdrop-blur pointer-events-none fixed bottom-5 right-5 z-40 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg">
          Đang làm mới dữ liệu...
        </div>
      ) : null}

      <RightDrawer
        isOpen={isSettingOpen}
        onClose={() => {
          return setIsSettingOpen(false);
        }}
        title="Cài đặt hệ thống"
      >
        <TargetSetupForm
          onSaved={() => {
            return setIsSettingOpen(false);
          }}
          cityOptions={filterOptions.branches}
        />
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
