# 📊 eSure Insurance Dashboard

Dashboard quản trị doanh số bảo hiểm — kết nối trực tiếp với **Cube.js** REST API để hiển thị KPI, biểu đồ, bảng dữ liệu theo thời gian thực.

## Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cài đặt & Chạy Dashboard](#cài-đặt--chạy-dashboard)
- [Kết nối với Cube.js API](#kết-nối-với-cubejs-api)
- [Cube.js Schema bắt buộc](#cubejs-schema-bắt-buộc)
- [API Endpoints Dashboard sử dụng](#api-endpoints-dashboard-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Tích hợp vào project khác](#tích-hợp-vào-project-khác)
- [Troubleshooting](#troubleshooting)

---

## Yêu cầu hệ thống

| Tool      | Version  |
|-----------|----------|
| Node.js   | >= 18.x  |
| npm       | >= 9.x   |
| Cube.js   | >= 0.35  |
| Database  | PostgreSQL / MySQL (Cube.js hỗ trợ) |

---

## Kiến trúc hệ thống

```
┌─────────────────┐     HTTP/REST      ┌──────────────┐      SQL       ┌────────────┐
│   Dashboard     │ ──────────────────► │  Cube.js API │ ────────────► │  Database  │
│  (React + Vite) │   localhost:3000    │  (Port 4000) │               │ PostgreSQL │
│   Port 3000     │ ◄────────────────── │              │ ◄──────────── │            │
└─────────────────┘     JSON Data       └──────────────┘    Results    └────────────┘
```

Dashboard **KHÔNG** kết nối trực tiếp vào database. Mọi dữ liệu đều đi qua Cube.js REST API.

---

## Cài đặt & Chạy Dashboard

### 1. Clone / Copy folder

```bash
# Copy folder dashboard vào project
cp -r dashboard/ /path/to/your/project/dashboard/
```

### 2. Cài đặt dependencies

```bash
cd dashboard
npm install
```

### 3. Chạy development server

```bash
npm run dev
```

Dashboard sẽ chạy tại: **http://localhost:3000**

### 4. Build production

```bash
npm run build    # Output → dist/
npm run preview  # Preview bản build
```

---

## Kết nối với Cube.js API

Dashboard kết nối đến Cube.js thông qua file **`src/lib/cubeClient.ts`**:

```typescript
// ⚠️ SỬA 2 BIẾN NÀY THEO MÔI TRƯỜNG CỦA BẠN
const CUBE_API_URL = 'http://localhost:4000/cubejs-api/v1';
const CUBE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Cấu hình theo môi trường

| Môi trường  | CUBE_API_URL                                | Ghi chú                        |
|-------------|---------------------------------------------|--------------------------------|
| Local dev   | `http://localhost:4000/cubejs-api/v1`       | Cube.js chạy local port 4000  |
| Docker      | `http://cube-api:4000/cubejs-api/v1`        | Tên container trong docker-compose |
| Production  | `https://your-domain.com/cubejs-api/v1`     | Qua reverse proxy (Nginx)      |

### Về CUBE_TOKEN

- **Dev mode** (`CUBEJS_DEV_MODE=true`): Cube.js chấp nhận bất kỳ JWT token nào → dùng token placeholder.
- **Production**: Cần tạo JWT token với secret khớp `CUBEJS_API_SECRET` trong `.env` của Cube.js.

```bash
# Tạo JWT token cho production (Node.js)
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({}, 'YOUR_CUBEJS_API_SECRET', { expiresIn: '30d' });
console.log(token);
"
```

---

## Cube.js Schema bắt buộc

Dashboard phụ thuộc vào **một Cube view** duy nhất: `dashboard_overview`.

### File schema: `model/cubes/dashboard_overview.yml`

```yaml
views:
  - name: dashboard_overview
    description: "Tổng quan dashboard - KPIs, revenue, orders"
    cubes:
      - join_path: orders
        includes:
          # Measures
          - count
          - totalRevenue
          - totalTax
          - totalPaid
          - totalDiscount
          - avgOrderValue
          # Dimensions
          - status
          - paymentmethod
          - paymentstatus
          - city
          - customerName
          - orderdate
          - createdat
          - delivereddate

      - join_path: orders.order_items
        prefix: true
        includes:
          - count
          - quantity
          - totalRevenue
          - totalTax
          - avgUnitPrice
          - productName
          - providerName
          - providerCode
          - packageName
          - durationName
          - durationMonths
          - createdat
```

### Các members mà Dashboard sử dụng

#### Measures (chỉ số)

| Member                                          | Mô tả                          |
|-------------------------------------------------|---------------------------------|
| `dashboard_overview.count`                      | Tổng số đơn hàng               |
| `dashboard_overview.totalRevenue`               | Tổng doanh thu                  |
| `dashboard_overview.totalPaid`                  | Tổng đã thanh toán              |
| `dashboard_overview.avgOrderValue`              | Giá trị đơn hàng trung bình    |
| `dashboard_overview.order_items_count`          | Tổng số sản phẩm               |
| `dashboard_overview.order_items_quantity`        | Tổng số lượng bán              |
| `dashboard_overview.order_items_totalRevenue`   | Doanh thu theo sản phẩm        |

#### Dimensions (chiều dữ liệu)

| Member                                          | Mô tả                   |
|-------------------------------------------------|--------------------------|
| `dashboard_overview.status`                     | Trạng thái đơn (COMPLETED, CANCELLED...) |
| `dashboard_overview.city`                       | Thành phố / Khu vực     |
| `dashboard_overview.paymentmethod`              | Phương thức thanh toán   |
| `dashboard_overview.orderdate`                  | Ngày đặt hàng           |
| `dashboard_overview.order_items_productName`    | Tên ngành hàng          |
| `dashboard_overview.order_items_packageName`    | Tên sản phẩm / gói BH  |
| `dashboard_overview.order_items_providerName`   | Nhà bảo hiểm            |
| `dashboard_overview.order_items_durationName`   | Thời hạn BH             |
| `dashboard_overview.order_items_createdat`      | Ngày tạo sản phẩm      |

---

## API Endpoints Dashboard sử dụng

Dashboard chỉ gọi **1 endpoint** duy nhất của Cube.js:

```
POST http://localhost:4000/cubejs-api/v1/load
Headers:
  Content-Type: application/json
  Authorization: <CUBE_TOKEN>
Body:
  { "query": { ...CubeQuery... } }
```

### Danh sách queries gửi đi (11 queries song song)

| # | Query                    | Mục đích                              | Time Dimension                     |
|---|--------------------------|---------------------------------------|------------------------------------|
| 1 | `KPI_QUERY`             | KPI tổng quan (doanh số, đơn hàng)   | `orderdate`                        |
| 2 | `ORDERS_BY_STATUS`      | Tỷ lệ hoàn thành theo status         | `orderdate`                        |
| 3 | `REVENUE_BY_CITY`       | Doanh số theo thành phố              | `orderdate`                        |
| 4 | `REVENUE_BY_PRODUCT`    | Doanh số theo sản phẩm              | `order_items_createdat`            |
| 5 | `REVENUE_BY_PAYMENT`    | Doanh số theo thanh toán             | `orderdate`                        |
| 6 | `REVENUE_BY_PROVIDER`   | Doanh số theo nhà BH (scorecards)   | `order_items_createdat`            |
| 7 | `DAILY_ORDERS`          | Trend hàng ngày (time tracking)      | `orderdate` (granularity: day)     |
| 8 | `DAILY_BY_PROVIDER`     | Trend theo NB hàng ngày (line chart) | `order_items_createdat` (day)      |
| 9 | `PARTNER_DETAIL`        | Bảng chi tiết sản phẩm × đối tác    | `order_items_createdat`            |
| 10| `PIE_PRODUCT_NAME`      | Pie chart ngành hàng                 | `order_items_createdat`            |
| 11| `PIE_DURATION`          | Pie chart thời hạn                   | `order_items_createdat`            |

Tất cả 11 queries chạy **song song** qua `Promise.all` và tự động refresh mỗi **60 giây**.

### Cách test API thủ công

```bash
# Test Cube.js đang chạy
curl http://localhost:4000/cubejs-api/v1/load \
  -H "Content-Type: application/json" \
  -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTI3MDAwMDB9.placeholder" \
  -d '{"query": {"measures": ["dashboard_overview.count", "dashboard_overview.totalRevenue"], "timeDimensions": [{"dimension": "dashboard_overview.orderdate", "dateRange": "This month"}]}}'
```

---

## Cấu trúc thư mục

```
dashboard/
├── index.html                  # Entry HTML
├── package.json                # Dependencies
├── vite.config.ts              # Vite + Tailwind + React config
├── tsconfig.json               # TypeScript config
│
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component
│   ├── index.css               # Global styles (Tailwind)
│   ├── types.ts                # TypeScript interfaces
│   │
│   ├── lib/                    # Core logic
│   │   ├── cubeClient.ts       # ⭐ Cube.js REST client (SỬA URL TẠI ĐÂY)
│   │   ├── cubeQueries.ts      # Định nghĩa các Cube queries
│   │   ├── cubeDataMapper.ts   # Map Cube data → Dashboard types
│   │   └── utils.ts            # Format currency, helpers
│   │
│   ├── hooks/                  # React hooks
│   │   ├── useFetchDashboardData.ts  # Hook lấy toàn bộ data
│   │   └── useCubeFilterOptions.ts   # Hook lấy filter options
│   │
│   └── components/             # UI Components
│       ├── DashboardContainer.tsx    # Layout chính
│       ├── Header.tsx                # Header + settings button
│       ├── FilterSection.tsx         # Bộ lọc (Thành phố, Sản phẩm...)
│       ├── MultiSelectDropdown.tsx   # Dropdown component
│       ├── LookerDateRangePicker.tsx # Date range picker
│       ├── KPISection.tsx            # Scorecards (NB cards)
│       ├── BaseMetricCard.tsx        # Card component
│       ├── MiniTables.tsx            # Top performers + Inactive
│       ├── DashboardPieCharts.tsx    # 4 pie charts (MUI X Charts)
│       ├── ChartsSection.tsx         # Donut + Bar chart (Recharts)
│       ├── ProviderRevenueChart.tsx  # Line chart theo NB
│       ├── RegionPerformanceTable.tsx# Bảng hiệu suất thành phố
│       ├── PartnerDetailTable.tsx    # Bảng chi tiết sản phẩm
│       ├── PaginationFooter.tsx      # Phân trang
│       ├── Drawer.tsx                # Settings drawer (Portal)
│       ├── TargetSetupForm.tsx       # Form cấu hình chỉ tiêu
│       └── TimeSetupForm.tsx         # Form cấu hình tiến độ
```

---

## Tích hợp vào project khác

### Bước 1: Copy folder

Copy toàn bộ folder `dashboard/` vào project mới. **Không cần** copy `node_modules/` và `dist/`.

### Bước 2: Cài dependencies

```bash
cd dashboard
npm install
```

### Bước 3: Cấu hình Cube.js API URL

Sửa file **`src/lib/cubeClient.ts`** — dòng 6-9:

```typescript
const CUBE_API_URL = 'http://<YOUR_CUBE_HOST>:<PORT>/cubejs-api/v1';
const CUBE_TOKEN = '<YOUR_JWT_TOKEN>';
```

### Bước 4: Đảm bảo Cube.js có schema `dashboard_overview`

Copy file `dashboard_overview.yml` vào thư mục `model/cubes/` (hoặc `schema/`) của Cube.js project.

> ⚠️ Schema này yêu cầu Cube.js project đã có 2 cubes cơ sở:
> - `orders` — bảng đơn hàng
> - `order_items` — bảng sản phẩm trong đơn (JOIN với orders)

### Bước 5: Đảm bảo CORS

Nếu Dashboard và Cube.js chạy khác domain/port, thêm CORS config vào Cube.js `cube.js` file:

```javascript
// cube.js
module.exports = {
  http: {
    cors: {
      origin: ['http://localhost:3000', 'https://your-domain.com'],
      credentials: true,
    },
  },
};
```

### Bước 6: Chạy

```bash
# Terminal 1: Cube.js API
cd cube-api
npm run dev
# → Chạy tại http://localhost:4000

# Terminal 2: Dashboard
cd dashboard
npm run dev
# → Chạy tại http://localhost:3000
```

---

## Cube.js API — Setup nhanh

Nếu bạn chưa có Cube.js API:

### Cài đặt qua npm

```bash
npx cubejs-cli create cube-api -d postgres
cd cube-api
```

### Cấu hình `.env`

```env
CUBEJS_DB_HOST=localhost
CUBEJS_DB_PORT=5432
CUBEJS_DB_NAME=your_database
CUBEJS_DB_USER=your_user
CUBEJS_DB_PASS=your_password
CUBEJS_DB_TYPE=postgres
CUBEJS_API_SECRET=your_secret_key
CUBEJS_DEV_MODE=true
CUBEJS_SCHEMA_PATH=model
```

### Copy schema & chạy

```bash
# Copy dashboard_overview.yml vào model/cubes/
cp dashboard_overview.yml model/cubes/

# Chạy Cube.js
npm run dev
# → API sẽ chạy tại http://localhost:4000
# → Playground tại http://localhost:4000/#/build
```

---

## Tech Stack

| Library              | Version   | Mục đích                         |
|----------------------|-----------|----------------------------------|
| React                | 19.x      | UI framework                     |
| Vite                 | 6.x       | Build tool + dev server          |
| TypeScript           | 5.8       | Type safety                      |
| Tailwind CSS         | 4.x       | Utility-first CSS                |
| Recharts             | 3.x       | Bar chart, Pie chart, Line chart |
| MUI X Charts         | 9.x       | Pie charts (Ngành hàng, Thời hạn...) |
| React Hook Form      | 7.x       | Form handling                    |
| Zod                  | 4.x       | Form validation                  |
| Lucide React         | 0.5x      | Icons                            |
| Motion               | 12.x      | Animations                       |

---

## Troubleshooting

### Dashboard trắng, không có dữ liệu

1. Kiểm tra Cube.js đang chạy: `curl http://localhost:4000/readyz`
2. Mở DevTools Console (F12) → tìm lỗi `Cube API error`
3. Kiểm tra CORS nếu khác port

### Lỗi `ECONNREFUSED localhost:4000`

Cube.js chưa chạy. Start Cube.js trước:

```bash
cd cube-api && npm run dev
```

### Lỗi `Error: Cube not found dashboard_overview`

Cube.js chưa có schema `dashboard_overview`. Copy file YAML vào `model/cubes/`.

### Dữ liệu hiển thị 0

- Kiểm tra date range — mặc định là "This month", có thể tháng hiện tại chưa có data
- Thử đổi date range sang "Last 30 days" hoặc "Last 365 days"

### Port 3000 / 4000 bị chiếm

```bash
# Windows: Tìm & kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc đổi port trong package.json
"dev": "vite --port=3001 --host=0.0.0.0"
```

---

## License

Private — eSure Insurance Platform.
