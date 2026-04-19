export interface KPIData {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  type?: 'partner' | 'highlight' | 'normal';
  partner?: 'MIC' | 'BaoLong';
  bgColor?: string;
  textColor?: string;
  logo?: string;
}

export interface RegionData {
  id: string;
  name: string;
  businessUnit: string;
  salesNT: number;
  salesNonNT: number;
  target: number;
  actual: number;
  completionRate: number;
}

export interface TimeTrackingData {
  name: string;
  value: number;
  color: string;
}

export interface RegionPerformanceData {
  id: string;
  region: string;
  dailySales: number;
  monthlySales: number;
  target: number;
  completionRate: number;
  caseSize: number;
  caseSizeTrend: 'up' | 'down' | 'neutral';
  activeUnits: number;
  totalUnits: number;
  activeRate: number;
  inactiveUnits: number;
}

export interface TopPerformerData {
  id: string;
  region: string;
  businessUnit: string;
  total: number;
}

export interface InactiveUnitData {
  id: string;
  region: string;
  inactiveCount: number;
  ratioText: string;
  gap: string;
}

export interface PartnerDetailRow {
  id: string;
  vung: string;
  chiNhanh: string;
  sanPham: string;
  tenGoi: string;
  thoiHan: string;
  nhaBaoHiem: string;
  phuongThucThanhToan: string;
  partnerName: string;
  quantity: number;
  tongDoanhThu: number;
  paymentStatus: string;
}

export interface DetailedProductRow {
  id: string;
  khuVuc: string;
  dvkd: string;
  doiTac: string;
  sanPham: string;
  isActive: boolean;
  slBan: number;
  caseSize: number;
  tongDT: number;
}

export type DetailedProduct = DetailedProductRow;

export interface ProviderDailyRevenue {
  date: string;
  [providerName: string]: number | string; // date + each provider as key
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface DashboardData {
  kpis: KPIData[];
  timeTracking: TimeTrackingData[];
  regions: RegionData[];
  regionPerformance: RegionPerformanceData[];
  topPerformers: TopPerformerData[];
  inactiveUnits: InactiveUnitData[];
  partnerDetails: PartnerDetailRow[];
  providerDailyRevenue: ProviderDailyRevenue[];
  providerNames: string[];
  pieCharts: {
    product: PieChartData[];
    duration: PieChartData[];
    provider: PieChartData[];
    payment: PieChartData[];
  };
}
