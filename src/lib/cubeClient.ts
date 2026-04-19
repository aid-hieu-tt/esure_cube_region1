/**
 * Cube.js REST API client
 * Dùng fetch thuần — không cần @cubejs-client/core
 *
 * Cấu hình qua biến môi trường (đặt trên platform hoặc file .env):
 *   VITE_CUBE_API_URL  — URL Cube.js API (mặc định: http://localhost:4000/cubejs-api/v1)
 *   VITE_CUBE_TOKEN    — JWT token xác thực (mặc định: placeholder cho dev mode)
 */

const CUBE_API_URL = import.meta.env.VITE_CUBE_API_URL || 'http://localhost:4000/cubejs-api/v1';
const CUBE_TOKEN = import.meta.env.VITE_CUBE_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTI3MDAwMDB9.placeholder';

export interface CubeQuery {
  measures?: string[];
  dimensions?: string[];
  filters?: Array<{
    member: string;
    operator: string;
    values?: string[];
  }>;
  timeDimensions?: Array<{
    dimension: string;
    granularity?: string;
    dateRange?: string | string[];
  }>;
  order?: Record<string, 'asc' | 'desc'>;
  limit?: number;
}

export interface CubeResultRow {
  [key: string]: string | number | null;
}

export async function cubeLoad(query: CubeQuery): Promise<CubeResultRow[]> {
  const response = await fetch(`${CUBE_API_URL}/load`, {
    method: 'POST', // Use POST for complex queries
    headers: {
      'Content-Type': 'application/json',
      'Authorization': CUBE_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cube API error (${response.status}): ${error}`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Chạy nhiều queries cùng lúc
 */
export async function cubeLoadMulti(queries: Record<string, CubeQuery>): Promise<Record<string, CubeResultRow[]>> {
  const entries = Object.entries(queries);
  const results = await Promise.all(
    entries.map(([, query]) => cubeLoad(query))
  );
  
  const mapped: Record<string, CubeResultRow[]> = {};
  entries.forEach(([key], i) => {
    mapped[key] = results[i];
  });
  return mapped;
}
