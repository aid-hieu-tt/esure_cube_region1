import { useState, useEffect } from 'react';
import { FilterState } from '../components/FilterSection';
import { DateRangeValue } from '../components/LookerDateRangePicker';
import { CrossFilterState } from '../context/CrossFilterContext';
import { cubeLoadMulti } from '../lib/cubeClient';
import { mapCubeDataToDashboard } from '../lib/cubeDataMapper';
import {
  KPI_QUERY,
  ORDERS_BY_STATUS_QUERY,
  REVENUE_BY_CITY_QUERY,
  REVENUE_BY_PRODUCT_QUERY,
  REVENUE_BY_PAYMENT_METHOD_QUERY,
  REVENUE_BY_PROVIDER_QUERY,
  DAILY_ORDERS_QUERY,
  DAILY_REVENUE_BY_PROVIDER_QUERY,
  PARTNER_DETAIL_QUERY,
  REVENUE_BY_PRODUCT_NAME_QUERY,
  REVENUE_BY_DURATION_QUERY,
} from '../lib/cubeQueries';
import { DashboardData } from '../types';

// Map FilterState selections → Cube.js filter objects
function buildCubeFilters(filters: FilterState): Array<{ member: string; operator: string; values: string[] }> {
  const cubeFilters: Array<{ member: string; operator: string; values: string[] }> = [];

  // Vùng 1 Specialized Dashboard Hardcoding
  cubeFilters.push({
    member: 'dashboard_overview.user_agencies_regionName',
    operator: 'equals',
    values: ['VIETBANK Miền Nam'],
  });

  if (filters.agencies && filters.agencies.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.agencies_name',
      operator: 'equals',
      values: filters.agencies,
    });
  }
  if (filters.branchCodes && filters.branchCodes.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.user_agencies_branchName',
      operator: 'equals',
      values: filters.branchCodes,
    });
  }
  if (filters.paymentStatuses.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.paymentstatus',
      operator: 'equals',
      values: filters.paymentStatuses,
    });
  }
  if (filters.products.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.order_items_productName',
      operator: 'equals',
      values: filters.products,
    });
  }
  if (filters.packages && filters.packages.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.order_items_packageName',
      operator: 'equals',
      values: filters.packages,
    });
  }
  if (filters.durations.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.order_items_durationName',
      operator: 'equals',
      values: filters.durations,
    });
  }
  if (filters.providers.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.order_items_providerName',
      operator: 'equals',
      values: filters.providers,
    });
  }
  if (filters.partners.length > 0) {
    cubeFilters.push({
      member: 'dashboard_overview.paymentmethod',
      operator: 'equals',
      values: filters.partners,
    });
  }

  return cubeFilters;
}

function buildCrossFilters(crossFilters: CrossFilterState, excludeKey?: string) {
  const result: Array<{ member: string; operator: string; values: string[] }> = [];
  const map: Record<string, string> = {
    regionCodes: 'dashboard_overview.user_agencies_regionName',
    branchCodes: 'dashboard_overview.user_agencies_branchName',
    paymentStatuses: 'dashboard_overview.paymentstatus',
    products: 'dashboard_overview.order_items_productName',
    packages: 'dashboard_overview.order_items_packageName',
    durations: 'dashboard_overview.order_items_durationName',
    providers: 'dashboard_overview.order_items_providerName',
    paymentMethod: 'dashboard_overview.paymentmethod',
  };

  for (const [key, value] of Object.entries(crossFilters)) {
    if (key === excludeKey) {
      continue;
    }
    if (!value) {
      continue;
    }
    if (map[key]) {
      result.push({
        member: map[key],
        operator: 'equals',
        values: [String(value)],
      });
    }
  }
  return result;
}

export const useFetchDashboardData = (
  dateRange: DateRangeValue = 'This month',
  filters: FilterState = {
    agencies: [],
    products: [],
    packages: [],
    paymentStatuses: [],
    durations: [],
    providers: [],
    partners: [],
    branchCodes: [],
  },
  crossFilters: CrossFilterState = {},
) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only show full-page spinner on initial load (no data yet)
        if (!data) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const globalCubeFilters = buildCubeFilters(filters);

        // Build query with time dimension + cross-filters
        const buildQuery = (baseQuery: any, dateDim: string, excludeCrossFilterKey?: string) => {
          const crossCubeFilters = buildCrossFilters(crossFilters, excludeCrossFilterKey);
          return {
            ...baseQuery,
            filters: [...(baseQuery.filters || []), ...globalCubeFilters, ...crossCubeFilters],
            timeDimensions: [
              {
                dimension: dateDim,
                dateRange: dateRange,
                ...(baseQuery.timeDimensions?.[0]?.granularity
                  ? { granularity: baseQuery.timeDimensions[0].granularity }
                  : {}),
              },
            ],
          };
        };

        const queries = {
          kpi: buildQuery(KPI_QUERY, 'dashboard_overview.orderdate'),
          status: buildQuery(ORDERS_BY_STATUS_QUERY, 'dashboard_overview.orderdate'),
          city: buildQuery(REVENUE_BY_CITY_QUERY, 'dashboard_overview.orderdate', 'regionCodes'),
          product: buildQuery(REVENUE_BY_PRODUCT_QUERY, 'dashboard_overview.order_items_createdat'),
          payment: buildQuery(REVENUE_BY_PAYMENT_METHOD_QUERY, 'dashboard_overview.orderdate', 'paymentMethod'),
          provider: buildQuery(REVENUE_BY_PROVIDER_QUERY, 'dashboard_overview.order_items_createdat', 'providers'),
          daily: buildQuery(DAILY_ORDERS_QUERY, 'dashboard_overview.orderdate'),
          dailyProvider: buildQuery(
            DAILY_REVENUE_BY_PROVIDER_QUERY,
            'dashboard_overview.order_items_createdat',
            'providers',
          ),
          details: buildQuery(PARTNER_DETAIL_QUERY, 'dashboard_overview.order_items_createdat'),
          pieProduct: buildQuery(REVENUE_BY_PRODUCT_NAME_QUERY, 'dashboard_overview.order_items_createdat'),
          pieDuration: buildQuery(REVENUE_BY_DURATION_QUERY, 'dashboard_overview.order_items_createdat', 'durations'),
        };

        const results = await cubeLoadMulti(queries);

        const dashboardData = mapCubeDataToDashboard(results as any);
        setData(dashboardData);
        setLoading(false);
        setRefreshing(false);
      } catch (err) {
        console.error('Failed to fetch Cube.js data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data from Cube.js');
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 300_000); // 5 phút
    return () => {
      return clearInterval(interval);
    };
  }, [dateRange ? JSON.stringify(dateRange) : null, JSON.stringify(filters), JSON.stringify(crossFilters)]);

  return { data, loading, refreshing, error };
};
