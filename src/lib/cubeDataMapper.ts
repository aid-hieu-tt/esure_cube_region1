/**
 * Cube.js data → Dashboard TypeScript types mapper
 */
import type {
  DashboardData,
  KPIData,
  RegionData,
  RegionPerformanceData,
  TopPerformerData,
  InactiveUnitData,
  TimeTrackingData,
  PartnerDetailRow,
  ProviderDailyRevenue,
  PieChartData,
} from '../types';
import { CubeResultRow } from './cubeClient';

// ============================================================
// Helpers
// ============================================================
function num(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function formatTr(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toLocaleString('vi-VN');
}

// ============================================================
// KPIs
// ============================================================
export function mapToKPIs(
  kpiData: CubeResultRow[],
  statusData: CubeResultRow[],
  providerData: CubeResultRow[],
): KPIData[] {
  const kpi = kpiData[0] || {};
  const totalRevenue = num(kpi['dashboard_overview.totalRevenue']);
  const totalOrders = num(kpi['dashboard_overview.count']);
  const avgOrderValue = num(kpi['dashboard_overview.avgOrderValue']);
  const totalPaid = num(kpi['dashboard_overview.totalPaid']);

  // Tính COMPLETED/CANCELLED counts
  const deliveredRow = statusData.find(r => str(r['dashboard_overview.status']) === 'COMPLETED');
  const cancelledRow = statusData.find(r => str(r['dashboard_overview.status']) === 'CANCELLED');
  const deliveredCount = num(deliveredRow?.['dashboard_overview.count']);
  const deliveredRevenue = num(deliveredRow?.['dashboard_overview.totalRevenue']);
  const cancelledCount = num(cancelledRow?.['dashboard_overview.count']);

  const completionRate = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

  // Top nhà bảo hiểm (providers) sorted by revenue
  const sortedProviders = [...providerData].sort((a, b) => num(b['dashboard_overview.order_items_totalRevenue']) - num(a['dashboard_overview.order_items_totalRevenue']));

  const providerCards = sortedProviders.slice(0, 5).map((row, i) => {
    const name = str(row['dashboard_overview.order_items_providerName']).trim() || `NB${i + 1}`;
    const revenue = num(row['dashboard_overview.order_items_totalRevenue']);
    const colors = [
      { bg: 'bg-[#f0f4f0]', text: 'text-black' },
      { bg: 'bg-[#d9e8f5]', text: 'text-black' },
      { bg: 'bg-[#fff0e0]', text: 'text-black' },
      { bg: 'bg-[#d9e8f5]', text: 'text-black' },
      { bg: 'bg-[#e8f5e9]', text: 'text-black' },
    ];
    const ids = ['provider1', 'provider2', 'provider3', 'provider4', 'provider5'];
    return {
      id: ids[i],
      title: name,
      subtitle: '',
      value: formatTr(revenue),
      bgColor: colors[i].bg,
      textColor: colors[i].text,
    };
  });

  return [
    ...providerCards,
    {
      id: 'luyke-donhang',
      title: 'Số đơn\nLũy kế',
      subtitle: '',
      value: totalOrders.toLocaleString('vi-VN'),
      bgColor: 'bg-[#ffea00]',
      textColor: 'text-black',
    },
    {
      id: 'luyke-doanhthu',
      title: 'Doanh số\nLũy kế',
      subtitle: '',
      value: formatTr(totalRevenue),
      bgColor: 'bg-[#ffea00]',
      textColor: 'text-black',
    },
    {
      id: 'soluongban',
      title: 'Số lượng bán',
      subtitle: '',
      value: (num(kpi['dashboard_overview.order_items_quantity']) || totalOrders).toLocaleString('vi-VN'),
      bgColor: 'bg-[#e3f2fd]',
      textColor: 'text-blue-800',
    },
    {
      id: 'casesize',
      title: 'DS bình quân\n(Case Size)',
      subtitle: '',
      value: formatTr(totalOrders > 0 ? totalRevenue / totalOrders : 0),
      bgColor: 'bg-[#f3e5f5]', // a light purple distinct from blue and yellow
      textColor: 'text-purple-800',
    },
  ];
}

// ============================================================
// Time Tracking (donut chart)
// ============================================================
export function mapToTimeTracking(dailyData: CubeResultRow[]): TimeTrackingData[] {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysRemaining = daysInMonth - daysPassed;

  return [
    { name: 'Đã qua', value: daysPassed, color: '#f3f4f6' },
    { name: 'Còn lại', value: daysRemaining, color: '#f97316' },
  ];
}

// ============================================================
// Regions (by partner)
// ============================================================
export function mapToRegions(cityData: CubeResultRow[]): RegionData[] {
  return cityData
    .filter(r => str(r['dashboard_overview.user_agencies_branchName']).trim() !== '')
    .map((row, i) => {
      const revenue = num(row['dashboard_overview.totalRevenue']);
      const paid = num(row['dashboard_overview.totalPaid']);
      const target = revenue * 1.3; // Estimated target: 130% of actual
      return {
        id: `kv${i + 1}`,
        name: str(row['dashboard_overview.user_agencies_branchName']).trim(),
        businessUnit: str(row['dashboard_overview.user_agencies_branchName']).trim(),
        salesNT: Math.round(revenue * 0.45),
        salesNonNT: Math.round(revenue * 0.55),
        target: Math.round(target),
        actual: Math.round(revenue),
        completionRate: target > 0 ? Math.round((revenue / target) * 100 * 10) / 10 : 0,
      };
    });
}

// ============================================================
// Region Performance (by partner)
// ============================================================
export function mapToRegionPerformance(cityData: CubeResultRow[]): RegionPerformanceData[] {
  return cityData
    .filter(r => str(r['dashboard_overview.user_agencies_branchName']).trim() !== '')
    .map((row, i) => {
      const monthlySales = num(row['dashboard_overview.totalRevenue']);
      const orderCount = num(row['dashboard_overview.count']);
      const target = monthlySales * 1.3;
      const caseSize = orderCount > 0 ? monthlySales / orderCount : 0;
      const totalUnits = Math.max(orderCount, 5);
      const activeUnits = Math.min(orderCount, totalUnits);
      const activeRate = totalUnits > 0 ? Math.round((activeUnits / totalUnits) * 100) : 0;

      return {
        id: `rp${i + 1}`,
        region: str(row['dashboard_overview.user_agencies_branchName']).trim(),
        dailySales: Math.round(monthlySales / 30),
        monthlySales: Math.round(monthlySales),
        target: Math.round(target),
        completionRate: target > 0 ? Math.round((monthlySales / target) * 100) : 0,
        caseSize: Math.round(caseSize),
        caseSizeTrend: caseSize > monthlySales / 30 ? 'up' as const : 'down' as const,
        activeUnits,
        totalUnits,
        activeRate,
        inactiveUnits: totalUnits - activeUnits,
      };
    });
}

// ============================================================
// Top Performers (by product)
// ============================================================
export function mapToTopPerformers(productData: CubeResultRow[], cityData: CubeResultRow[]): TopPerformerData[] {
  return productData
    .filter(r => str(r['dashboard_overview.order_items_packageName']).trim() !== '')
    .slice(0, 7)
    .map((row, i) => ({
      id: String(i + 1),
      region: str(row['dashboard_overview.user_agencies_branchName']).trim() || 'N/A',
      businessUnit: str(row['dashboard_overview.order_items_packageName']).trim(),
      total: num(row['dashboard_overview.order_items_totalRevenue']),
    }));
}

// ============================================================
// Inactive Units
// ============================================================
export function mapToInactiveUnits(cityData: CubeResultRow[]): InactiveUnitData[] {
  return cityData
    .filter(r => str(r['dashboard_overview.user_agencies_branchName']).trim() !== '')
    .map((row, i) => {
      const orderCount = num(row['dashboard_overview.count']);
      const totalUnits = Math.max(orderCount, 10);
      const inactiveCount = Math.max(0, totalUnits - orderCount);
      const gap = num(row['dashboard_overview.totalRevenue']) * 0.3;

      return {
        id: String(i + 1),
        region: str(row['dashboard_overview.user_agencies_branchName']).trim(),
        inactiveCount,
        ratioText: `${inactiveCount}/${totalUnits} (${totalUnits > 0 ? Math.round((inactiveCount / totalUnits) * 100) : 0}%)`,
        gap: formatTr(gap),
      };
    });
}

// ============================================================
// Partner Details (product × payment method breakdown)
// ============================================================
export function mapToPartnerDetails(detailsData: CubeResultRow[]): PartnerDetailRow[] {
  return detailsData
    .filter(r => str(r['dashboard_overview.order_items_packageName']).trim() !== '')
    .map((row, i) => {
      const revenue = num(row['dashboard_overview.order_items_totalRevenue']);

      return {
        id: String(i + 1),
        vung: str(row['dashboard_overview.user_agencies_regionName']).trim() || 'N/A',
        chiNhanh: str(row['dashboard_overview.user_agencies_branchName']).trim() || 'N/A',
        sanPham: str(row['dashboard_overview.order_items_productName']).trim() || 'N/A',
        tenGoi: str(row['dashboard_overview.order_items_packageName']).trim().substring(0, 30),
        thoiHan: str(row['dashboard_overview.order_items_durationName']).trim() || '12 tháng (1 năm)',
        nhaBaoHiem: str(row['dashboard_overview.order_items_providerName']).trim() || 'BaoLong',
        phuongThucThanhToan: str(row['dashboard_overview.paymentmethod']).trim() || 'KHÁC',
        partnerName: str(row['dashboard_overview.agencies_name']).trim() || 'N/A',
        paymentStatus: str(row['dashboard_overview.paymentstatus']).trim() || 'N/A',
        quantity: num(row['dashboard_overview.order_items_quantity']),
        tongDoanhThu: revenue,
      };
    });
}

// ============================================================
// Provider Daily Revenue (for line chart)
// ============================================================
export function mapToProviderDailyRevenue(dailyProviderData: CubeResultRow[]): {
  chartData: ProviderDailyRevenue[];
  providerNames: string[];
} {
  // Collect all unique provider names
  const providerSet = new Set<string>();
  const dateMap = new Map<string, Record<string, number>>();

  for (const row of dailyProviderData) {
    const provider = str(row['dashboard_overview.order_items_providerName']).trim();
    const dateRaw = str(row['dashboard_overview.order_items_createdat.day']).trim();
    const revenue = num(row['dashboard_overview.order_items_totalRevenue']);

    if (!provider || !dateRaw) continue;
    providerSet.add(provider);

    const dateKey = dateRaw.substring(0, 10); // YYYY-MM-DD
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {});
    }
    const dayRecord = dateMap.get(dateKey)!;
    dayRecord[provider] = (dayRecord[provider] || 0) + revenue;
  }

  const providerNames = Array.from(providerSet).sort();

  // Convert map to sorted array
  const chartData: ProviderDailyRevenue[] = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, providers]) => {
      const entry: ProviderDailyRevenue = {
        date: date.substring(5), // MM-DD for display
      };
      for (const name of providerNames) {
        entry[name] = providers[name] || 0;
      }
      return entry;
    });

  return { chartData, providerNames };
}

// ============================================================
// Pie Chart Data mapping
// ============================================================
export function mapToPieChartData(rows: CubeResultRow[], dimKey: string, measureKey: string): PieChartData[] {
  return rows
    .map(r => ({
      name: str(r[dimKey]) || 'Khác',
      value: num(r[measureKey]),
    }))
    .filter(d => d.value > 0);
}

// ============================================================
// Master mapper
// ============================================================
export function mapCubeDataToDashboard(results: {
  kpi: CubeResultRow[];
  status: CubeResultRow[];
  city: CubeResultRow[];
  product: CubeResultRow[];
  payment: CubeResultRow[];
  provider: CubeResultRow[];
  daily: CubeResultRow[];
  dailyProvider: CubeResultRow[];
  details: CubeResultRow[];
  pieProduct: CubeResultRow[];
  pieDuration: CubeResultRow[];
}): DashboardData {
  const { chartData, providerNames } = mapToProviderDailyRevenue(results.dailyProvider);
  return {
    kpis: mapToKPIs(results.kpi, results.status, results.provider),
    timeTracking: mapToTimeTracking(results.daily),
    regions: mapToRegions(results.city),
    regionPerformance: mapToRegionPerformance(results.city),
    topPerformers: mapToTopPerformers(results.product, results.city),
    inactiveUnits: mapToInactiveUnits(results.city),
    partnerDetails: mapToPartnerDetails(results.details),
    providerDailyRevenue: chartData,
    providerNames,
    pieCharts: {
      product: mapToPieChartData(results.pieProduct, 'dashboard_overview.order_items_productName', 'dashboard_overview.order_items_totalRevenue'),
      duration: mapToPieChartData(results.pieDuration, 'dashboard_overview.order_items_durationName', 'dashboard_overview.order_items_totalRevenue'),
      provider: mapToPieChartData(results.provider, 'dashboard_overview.order_items_providerName', 'dashboard_overview.order_items_totalRevenue'),
      payment: mapToPieChartData(results.payment, 'dashboard_overview.paymentmethod', 'dashboard_overview.totalRevenue'),
    }
  };
}
