/**
 * Hook lấy distinct dimension values từ Cube.js cho filter dropdowns
 * Kèm theo metric (totalRevenue) theo dateRange hiện tại
 */
import { useState, useEffect } from 'react';
import { DateRangeValue } from '../components/LookerDateRangePicker';
import { cubeLoad, CubeResultRow } from '../lib/cubeClient';

export interface FilterOption {
  id: string;
  label: string;
  metric?: number; // e.g. total revenue for this option
}

export interface FilterOptions {
  cities: FilterOption[];
  statuses: FilterOption[];
  productOptions: FilterOption[];
  packageOptions: FilterOption[];
  paymentStatuses: FilterOption[];
  durations: FilterOption[];
  providers: FilterOption[];
  paymentMethods: FilterOption[];
  regions: FilterOption[];
  branches: FilterOption[];
  loading: boolean;
}

function toOptionsWithMetric(rows: CubeResultRow[], dimKey: string, measureKey: string): FilterOption[] {
  return rows
    .map(r => {
      const val = String(r[dimKey] ?? '').trim();
      const metric = Number(r[measureKey] ?? 0);
      return { val, metric };
    })
    .filter(v => {
      return v.val !== '' && v.val !== 'null' && v.val !== 'N/A';
    })
    .sort((a, b) => {
      return b.metric - a.metric;
    }) // Sort descending by metric
    .map(v => {
      return { id: v.val, label: v.val, metric: v.metric };
    });
}

export function useCubeFilterOptions(dateRange: DateRangeValue = 'This month'): FilterOptions {
  const [options, setOptions] = useState<FilterOptions>({
    cities: [],
    statuses: [],
    productOptions: [],
    packageOptions: [],
    paymentStatuses: [],
    durations: [],
    providers: [],
    paymentMethods: [],
    regions: [],
    branches: [],
    loading: true,
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const orderTimeDim = { dimension: 'dashboard_overview.orderdate', dateRange };
        const itemTimeDim = { dimension: 'dashboard_overview.order_items_createdat', dateRange };

        const regionFilter = {
          member: 'dashboard_overview.user_agencies_regionName',
          operator: 'equals',
          values: ['VIETBANK Miền Nam'],
        };

        const [cityRows, statusRows, productRows, catRows, durationRows, providerRows, paymentRows, branchRows] =
          await Promise.all([
            cubeLoad({
              measures: ['dashboard_overview.totalRevenue'],
              dimensions: ['dashboard_overview.agencies_name'],
              timeDimensions: [orderTimeDim],
              filters: [regionFilter],
              order: { 'dashboard_overview.totalRevenue': 'desc' },
              limit: 100,
            }),
            cubeLoad({
              dimensions: ['dashboard_overview.status'],
              timeDimensions: [orderTimeDim],
              filters: [regionFilter],
              order: { 'dashboard_overview.status': 'asc' },
              limit: 50,
            }),
            cubeLoad({
              measures: ['dashboard_overview.order_items_totalRevenue'],
              dimensions: ['dashboard_overview.order_items_productName', 'dashboard_overview.order_items_packageName'],
              timeDimensions: [itemTimeDim],
              filters: [regionFilter],
              order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
              limit: 200,
            }),
            cubeLoad({
              measures: ['dashboard_overview.totalRevenue'],
              dimensions: ['dashboard_overview.paymentstatus'],
              timeDimensions: [orderTimeDim],
              filters: [regionFilter],
              order: { 'dashboard_overview.totalRevenue': 'desc' },
              limit: 50,
            }),
            cubeLoad({
              measures: ['dashboard_overview.order_items_totalRevenue'],
              dimensions: ['dashboard_overview.order_items_durationName'],
              timeDimensions: [itemTimeDim],
              filters: [regionFilter],
              order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
              limit: 100,
            }),
            cubeLoad({
              measures: ['dashboard_overview.order_items_totalRevenue'],
              dimensions: ['dashboard_overview.order_items_providerName'],
              timeDimensions: [itemTimeDim],
              filters: [regionFilter],
              order: { 'dashboard_overview.order_items_totalRevenue': 'desc' },
              limit: 50,
            }),
            cubeLoad({
              measures: ['dashboard_overview.totalRevenue'],
              dimensions: ['dashboard_overview.paymentmethod'],
              timeDimensions: [orderTimeDim],
              filters: [regionFilter],
              order: { 'dashboard_overview.totalRevenue': 'desc' },
              limit: 50,
            }),
            // Only fetch branches belonging to Vùng 1
            cubeLoad({
              measures: ['dashboard_overview.totalRevenue'],
              dimensions: ['dashboard_overview.user_agencies_branchName'],
              filters: [regionFilter],
              timeDimensions: [orderTimeDim],
              order: { 'dashboard_overview.totalRevenue': 'desc' },
              limit: 40,
            }),
          ]);

        setOptions({
          cities: toOptionsWithMetric(cityRows, 'dashboard_overview.agencies_name', 'dashboard_overview.totalRevenue'),
          statuses: toOptionsWithMetric(statusRows, 'dashboard_overview.status', 'dashboard_overview.totalRevenue'),
          productOptions: toOptionsWithMetric(
            productRows,
            'dashboard_overview.order_items_productName',
            'dashboard_overview.order_items_totalRevenue',
          ),
          packageOptions: toOptionsWithMetric(
            productRows,
            'dashboard_overview.order_items_packageName',
            'dashboard_overview.order_items_totalRevenue',
          ),
          paymentStatuses: toOptionsWithMetric(
            catRows,
            'dashboard_overview.paymentstatus',
            'dashboard_overview.totalRevenue',
          ),
          durations: toOptionsWithMetric(
            durationRows,
            'dashboard_overview.order_items_durationName',
            'dashboard_overview.order_items_totalRevenue',
          ),
          providers: toOptionsWithMetric(
            providerRows,
            'dashboard_overview.order_items_providerName',
            'dashboard_overview.order_items_totalRevenue',
          ),
          paymentMethods: toOptionsWithMetric(
            paymentRows,
            'dashboard_overview.paymentmethod',
            'dashboard_overview.totalRevenue',
          ),
          regions: [], // Not used in Vùng 1 dashboard
          branches: toOptionsWithMetric(
            branchRows,
            'dashboard_overview.user_agencies_branchName',
            'dashboard_overview.totalRevenue',
          ),
          loading: false,
        });
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
        setOptions(prev => {
          return { ...prev, loading: false };
        });
      }
    };

    fetchOptions();
  }, [JSON.stringify(dateRange)]);

  return options;
}
