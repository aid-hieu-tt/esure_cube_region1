/**
 * Cube.js Query definitions cho Dashboard
 */
import { CubeQuery } from './cubeClient';

/** KPI tổng quan: tổng doanh số, số đơn, avg order value */
export const KPI_QUERY: CubeQuery = {
  measures: [
    'dashboard_overview.count',
    'dashboard_overview.totalRevenue',
    'dashboard_overview.avgOrderValue',
    'dashboard_overview.totalPaid',
    'dashboard_overview.order_items_quantity',
  ],
  timeDimensions: [{
    dimension: 'dashboard_overview.orderdate',
    dateRange: 'This month',
  }],
};

/** KPI theo status: để tính tỷ lệ hoàn thành */
export const ORDERS_BY_STATUS_QUERY: CubeQuery = {
  measures: ['dashboard_overview.count', 'dashboard_overview.totalRevenue'],
  dimensions: ['dashboard_overview.status'],
  timeDimensions: [{
    dimension: 'dashboard_overview.orderdate',
    dateRange: 'This month',
  }],
};

/** Doanh số theo đại lý (Partner) */
export const REVENUE_BY_CITY_QUERY: CubeQuery = {
  measures: ['dashboard_overview.totalRevenue', 'dashboard_overview.count', 'dashboard_overview.totalPaid'],
  dimensions: ['dashboard_overview.user_agencies_branchName'],
  order: { 'dashboard_overview.totalRevenue': 'desc' },
  limit: 15,
  timeDimensions: [{
    dimension: 'dashboard_overview.orderdate',
    dateRange: 'Last 365 days',
  }],
};

/** Doanh số theo sản phẩm */
export const REVENUE_BY_PRODUCT_QUERY: CubeQuery = {
  measures: ['dashboard_overview.order_items_totalRevenue', 'dashboard_overview.order_items_quantity', 'dashboard_overview.order_items_count'],
  dimensions: [
    'dashboard_overview.user_agencies_branchName',
    'dashboard_overview.order_items_productName', 
    'dashboard_overview.order_items_packageName',
    'dashboard_overview.order_items_durationName',
    'dashboard_overview.order_items_providerName'
  ],
  order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
  limit: 20,
  timeDimensions: [{
    dimension: 'dashboard_overview.order_items_createdat',
    dateRange: 'Last 365 days',
  }],
};

/** Doanh số theo ngành hàng (productName) cho Pie Chart */
export const REVENUE_BY_PRODUCT_NAME_QUERY: CubeQuery = {
  measures: ['dashboard_overview.order_items_totalRevenue'],
  dimensions: ['dashboard_overview.order_items_productName'],
  order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
  timeDimensions: [{
    dimension: 'dashboard_overview.order_items_createdat',
    dateRange: 'Last 365 days',
  }],
};

/** Doanh số theo thời hạn (durationName) cho Pie Chart */
export const REVENUE_BY_DURATION_QUERY: CubeQuery = {
  measures: ['dashboard_overview.order_items_totalRevenue'],
  dimensions: ['dashboard_overview.order_items_durationName'],
  order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
  timeDimensions: [{
    dimension: 'dashboard_overview.order_items_createdat',
    dateRange: 'Last 365 days',
  }],
};

/** Chi tiết Sản phẩm & Đối tác (Bảng lớn bên dưới) */
export const PARTNER_DETAIL_QUERY: CubeQuery = {
  measures: ['dashboard_overview.order_items_totalRevenue', 'dashboard_overview.order_items_quantity', 'dashboard_overview.order_items_count'],
  dimensions: [
    'dashboard_overview.agencies_name',
    'dashboard_overview.user_agencies_regionName',
    'dashboard_overview.user_agencies_branchName',
    'dashboard_overview.order_items_packageName',
    'dashboard_overview.order_items_durationName',
    'dashboard_overview.order_items_providerName',
    'dashboard_overview.paymentmethod',
    'dashboard_overview.paymentstatus'
  ],
  order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
  limit: 50,
  timeDimensions: [{
    dimension: 'dashboard_overview.order_items_createdat',
    dateRange: 'Last 365 days',
  }],
};

/** Doanh số theo phương thức thanh toán (= đối tác) */
export const REVENUE_BY_PAYMENT_METHOD_QUERY: CubeQuery = {
  measures: ['dashboard_overview.totalRevenue', 'dashboard_overview.count'],
  dimensions: ['dashboard_overview.paymentmethod'],
  timeDimensions: [{
    dimension: 'dashboard_overview.orderdate',
    dateRange: 'Last 365 days',
  }],
};

/** Doanh số theo nhà bảo hiểm (provider) — cho Scorecard */
export const REVENUE_BY_PROVIDER_QUERY: CubeQuery = {
  measures: ['dashboard_overview.order_items_totalRevenue', 'dashboard_overview.order_items_quantity'],
  dimensions: ['dashboard_overview.order_items_providerName'],
  order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
  limit: 10,
  timeDimensions: [{
    dimension: 'dashboard_overview.order_items_createdat',
    dateRange: 'Last 365 days',
  }],
};

/** Doanh số daily (cho time tracking chart) */
export const DAILY_ORDERS_QUERY: CubeQuery = {
  measures: ['dashboard_overview.count', 'dashboard_overview.totalRevenue'],
  timeDimensions: [{
    dimension: 'dashboard_overview.orderdate',
    granularity: 'day',
    dateRange: 'This month',
  }],
  order: { 'dashboard_overview.orderdate': 'asc' },
};

/** Doanh số daily theo nhà bảo hiểm (cho line chart) */
export const DAILY_REVENUE_BY_PROVIDER_QUERY: CubeQuery = {
  measures: ['dashboard_overview.order_items_totalRevenue'],
  dimensions: ['dashboard_overview.order_items_providerName'],
  timeDimensions: [{
    dimension: 'dashboard_overview.order_items_createdat',
    granularity: 'day',
    dateRange: 'Last 30 days',
  }],
  order: { 'dashboard_overview.order_items_createdat': 'asc' },
};
