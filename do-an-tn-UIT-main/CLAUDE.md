# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo of 3 independently-installed apps (no workspace tooling — run `npm install` in each):

| Folder | Stack | Dev URL |
|---|---|---|
| `back_end_project` | NestJS 11 + Mongoose (MongoDB Atlas) + Socket.IO + Swagger | `http://localhost:4000/api`, docs at `/api/docs` |
| `front_end_project` | React 18 + Vite + TS + Tailwind + Zustand — **admin/staff** app | `http://localhost:5173` |
| `customer_app` | React 18 + Vite + TS + Tailwind + Zustand — **customer** storefront | `http://localhost:5174` (port pinned in `vite.config.ts`) |

## Commands

```bash
# Backend (from back_end_project/)
npm run start:dev          # watch mode
npm run build && npm run start:prod
npm run lint               # eslint --fix over src/apps/libs/test
npm run seed               # wipes `products` collection, reseeds from du-lieu-san-pham.json
npm run dedupe:products    # merge duplicate products (src/cong-cu/gop-san-pham-trung.ts)
npm run tao-admin          # tạo admin đầu tiên (POST /auth/register là admin-only, không tự bootstrap được)
npm run export:json        # xuất mọi collection ra du-lieu-mau/*.json (Extended JSON)
npm run import:json        # nạp lại; bỏ qua collection đã có dữ liệu trừ khi --ghi-de

# Admin app (from front_end_project/) / Customer app (from customer_app/)
npm run dev
npm run build              # tsc && vite build — type errors fail the build
npm run lint               # --max-warnings 0
```

**There are no tests in this repo.** `package.json` declares Jest (`npm test`, `test:e2e`) but no `*.spec.ts` and no `test/jest-e2e.json` exist, so those scripts fail. If asked to add a backend test, create `src/**/<name>.spec.ts` (testRegex is `.*\.spec\.ts$`, rootDir `src`) and run a single one with `npx jest src/path/to/file.spec.ts`.

## Environment

`back_end_project/.env` (untracked): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT`, `NODE_ENV`.

Gotchas worth knowing before debugging config issues:
- CORS and the Socket.IO gateway read **`FRONTEND_URLS`** (comma-separated, plural). The local `.env` only has `FRONTEND_URL`, so both fall back to `http://localhost:5173,http://localhost:5174`. Any other origin is rejected.
- Admin app reads `VITE_API_BASE_URL` (must include `/api`).
- Customer app reads **two** vars: `VITE_API_BASE_URL` (axios base, includes `/api`) in `src/api/client.ts`, and `VITE_API_URL` (server root, **no** `/api`) used only to prefix relative `imageUrl` values in the product pages.
- `requestOtp` returns the OTP in the response body only when `NODE_ENV === 'development'`; there is no SMS provider — otherwise the code is visible only in server logs.

## Naming convention (read this first)

Backend and admin frontend are written with **Vietnamese identifiers and filenames**. Match the surrounding style; do not "translate" existing names.

| Vietnamese | Meaning | Example |
|---|---|---|
| `phan-he` / `PhanHe` | module | `PhanHeDonHang` |
| `dieu-khien` / `DieuKhien` | controller | `don-hang.dieu-khien.ts` |
| `dich-vu` / `DichVu` | service | `DichVuDonHang` |
| `thuc-the` | entity/schema | `nha-cung-cap.thuc-the.ts` |
| `dung-chung` | shared (guards, enums, decorators, cache) | `dung-chung/bao-ve/bao-ve-jwt.ts` |
| `bao-ve` / `trang-tri` / `liet-ke` | guard / decorator / enum | `BaoVeJwt`, `VaiTro()`, `TrangThaiDonHang` |
| `linh-vuc` / `ha-tang` / `giao-dien` / `kho-trang-thai` / `dinh-tuyen` | domain / infrastructure / UI / store / routing (admin FE) | |
| `Trang…` / `BieuMau…` / `HopThoai…` | Page / Form / Dialog components | `TrangKiemKe.tsx` |

Mongoose **schema classes and DB fields stay in English** (`Order`, `Product`, `Purchase`, `StockBatch`, `User`) except `KhachHang` (fields `soDienThoai`, `ten`, `diaChi`; collection `customers`) and `NhaCungCap` (collection `nha-cung-cap`). Expect mixed-language objects at the service boundary.

## Multi-tenancy — read before touching any query

The system serves many stores from one deployment. **Every tenant collection carries `storeId`, and filtering is enforced at the query layer, not by remembering to add a `where` clause.**

- `src/dung-chung/da-cua-hang/ngu-canh-cua-hang.ts` — an `AsyncLocalStorage` holding `{ storeId }` for the request.
- `src/dung-chung/da-cua-hang/plugin-da-cua-hang.ts` — a Mongoose plugin applied to all 10 tenant schemas. It adds a required `storeId`, injects the filter into every `find/count/update/delete/distinct`, stamps new documents in `pre('validate')`, and unshifts a `$match` onto every `aggregate`. **With no store context it throws** rather than silently returning every tenant's data — if you see `[da-cua-hang] Thiếu ngữ cảnh cửa hàng`, the request never established context, that is the bug to fix.
- `CuaHang` (`stores` collection) is the only schema without the plugin.

How context gets set, in order:
1. `NguCanhCuaHangMiddleware` runs for every request (middleware runs *before* guards, the only place `AsyncLocalStorage` can wrap the whole lifecycle) and resolves `X-Store-Code` / `?store=` → `storeId` for public customer traffic.
2. `ChienLuocJwt.validate()` overwrites it with the token's `storeId` (mutating the same context object) and rejects tokens whose store does not match the user.
3. `DichVuXacThuc.login()` calls `datStoreIdHienTai()` right after finding the user, since login itself has no token yet.

`chayBoQuaLoc()` is the only escape hatch. Its legitimate uses are exactly: finding a user by email at login, the JWT strategy's user/customer lookup, and the migration/seed scripts. Never reach for it to "make a query work" — that is how a cross-tenant leak gets shipped.

Consequences to keep in mind:
- Unique indexes are compound: `{storeId, sku}`, `{storeId, barcode}`, `{storeId, orderNumber}`, `{storeId, purchaseNumber}`, `{storeId, soDienThoai}`, `{storeId, code}`. `User.email` stays globally unique — one account belongs to one store.
- `@CongKhai()` endpoints still parse a Bearer token when one is present (see `BaoVeJwt`), because the admin app calls public product endpoints and needs its store context. A bad token on a public route is ignored, not rejected.
- Existing data is migrated with `npm run migrate:multi-store -- <ma-cua-hang> "<Tên cửa hàng>"`, which backfills `storeId` and drops the obsolete single-field unique indexes. It is idempotent.
- `npm run seed -- <ma-cua-hang>` seeds into one store and deletes only that store's products (it no longer drops the whole `products` collection).
- The customer app puts the store code in the path (`/s/tap-hoa-minh-anh/...`) and feeds it to React Router as `basename`, so every in-app link stays store-relative; `src/api/storeContext.ts` also supplies the `X-Store-Code` header.
- `CuaHang.nganhHang` (`tap-hoa`, `vat-lieu-xay-dung`) exists so industry-specific behaviour can branch later. Keep the core (products, orders, purchases, debt) industry-neutral; batches/expiry are grocery-specific.

## Backend architecture

Each module under `src/phan-he/<name>/` is a standard Nest triple (`*.phan-he.ts`, `*.dieu-khien.ts`, `*.dich-vu.ts`) plus `dto/` and `schemas/`. `src/main.ts` sets global prefix `api`, a strict `ValidationPipe` (`whitelist` + **`forbidNonWhitelisted`** — an unexpected body field is a 400, so DTOs must be updated whenever a client starts sending a new field), and the global `BoLocNgoaiLeHttp` filter.

Auth: `BaoVeJwt` (extends passport-jwt, honours the `@CongKhai()` public marker) + `BaoVeVaiTro` (reads `@VaiTro(...)`), applied per-controller with `@UseGuards`. Roles: `admin`, `staff`, `customer` — one JWT scheme covers both staff and customers, with the role in the payload deciding access. `ChienLuocJwt.validate()` puts `{ id, role, … }` on the request — staff get `email`/`fullName`/`phone`, customers get `soDienThoai`/`ten` — and `@NguoiDungHienTai('id'|'fullName'|'soDienThoai')` extracts those fields (note: `id`, never `userId` or `_id`).

Cross-module dependency direction (services inject each other directly; there is no repository layer):

```
bang-dieu-khien → giao-dich → don-hang ─┬→ san-pham
bao-cao ────────────────────────────────┼→ khach-hang
                                        └→ nhap-hang → stock-batch → san-pham
goi-y-nhap-hang → nhap-hang + Order/Product models
```

### Stock is written through two paths — always keep them consistent

`Product.stock` is the source of truth for "how many do we have"; `StockBatch` documents track lots (expiry, lot number, source purchase). Every stock mutation must go through one of:
- `DichVuStockBatch.deductFEFO()` — deducts oldest-expiry batches first **and** decrements `Product.stock`. Throws if any batch is already expired.
- `DichVuSanPham.updateStock({operation: ADD|SUBTRACT|SET})` — direct `Product.stock` change, used as the fallback when a product has no batches.

Callers choose with `await stockBatch.hasBatches(productId)` (see `DichVuDonHang.create`). New code that moves stock must replicate this branch or batches will desynchronise from `Product.stock`.

Batches are created on goods receipt (`PATCH /purchases/:id/receive`) and on returns/cancellations (`addStockForReturn` creates a synthetic `RETURN-*` lot with a +365d expiry).

### Order lifecycle and after-sale rules

`TrangThaiDonHang` is exactly `pending | shipping | completed | cancelled`. Legacy DB values (`cho_xac_nhan`, `confirmed`, `processing`, `dang_van_chuyen`, `hoan_thanh`, `delivered`, `da_huy`) still exist in production data and are normalised by `normalizeStatusForRule()` on read and expanded inside `findAll` filters. Keep both sides in sync when touching status logic.

- Transitions (enforced in `updateStatus`): `pending → shipping|cancelled`, `shipping → completed|cancelled`; `completed`/`cancelled` are terminal.
- POS orders (`POST /orders`) are created directly as `completed` + `PAID` (or `DEBT` when `isDebt`), `isOnline: false`.
- Customer orders (`POST /orders/customer`, public) start `pending` + `DEBT`, `isOnline: true`, and deduct stock immediately.
- The "online vs offline" filter in `findAll` is heuristic: `isOnline: true` **or** (has `customerAddress` and no `createdBy`). Old rows lack `isOnline`, hence the fallback.
- Exchange/return (`POST /orders/exchange|return`) create separate `EXCHANGE`/`RETURN` orders carrying `relatedOrderCode` and **negative** subtotal/total. `assertAfterSaleEligible()` requires: original is a `SALE` with an `ORD…` number, `completed`, `PAID`, never a debt (`wasDebt !== true`), and has no prior after-sale (`hasAfterSale` or an existing linked doc).
- Document numbers are `ORD/EXC/RET + yymmdd + 4-digit counter` derived from `countDocuments()` (racy, and gaps after deletes). `Purchase` numbers avoid this by scanning the day's max number and retrying up to 5× on duplicate-key.

### Cost of goods (`importPrice`) and profit

`OrderItem.importPrice` snapshots the cost at sale time. Older rows have `0`, so `DichVuDonHang.enrichOrdersWithCost()` back-fills from the current `Product.purchasePrice` on every `findAll`/`findOne`; `DichVuBaoCao.calculateOrderMetrics()` adds a further fallback of `salePrice * 0.75` when no cost is known. Profit = revenue − COGS from order items (not purchase totals). Reports and dashboard therefore give slightly different numbers from raw aggregation — expected; do not "fix" it by switching to `purchaseCost`.

### Caching and realtime

`src/dung-chung/cache/cache-nho.ts` is a process-local `Map` with 60s TTL, keyed `dashboard:*`, `tx:*`, `reports:*`. Any write path that changes revenue **must** call `invalidateDashboardCache()` (see `DichVuDonHang`); otherwise stale numbers persist for up to a minute. It is per-process, so it breaks under multi-instance deployment.

`DonHangGateway` (namespace `/orders`) emits `order.created` / `order.updated` with a trimmed payload. The admin app connects in `src/ha-tang/socket/ordersSocket.ts` for admin/staff only and uses the events solely to refresh the pending-order badge.

Dates: dashboard and transaction summaries build explicit `+07:00` ISO strings (`Asia/Ho_Chi_Minh`) so results do not shift on a UTC server. Reuse those helpers instead of plain `new Date()` boundaries.

## Frontend architecture (admin — `front_end_project`)

Layered, with path aliases declared in both `vite.config.ts` and `tsconfig.json` (`@/`, `@/linh-vuc`, `@/ha-tang`, `@/giao-dien`, `@/kho-trang-thai`, `@/dinh-tuyen`):

- `linh-vuc/<domain>/` — entities, `services/`, `repositories/` (interface + `Real*` impl), `usecases/` (`CreateOrder`, `GetAllOrders`, … exposing `.execute()`).
- `ha-tang/api/` — `khachHangApi.ts` is the **axios instance** (JWT read from `localStorage['auth-storage']`, delayed global spinner, 401 → wipe storage + redirect to `/login`, except on the login request itself); `cau-hinh/apiEndpoints.ts` is the single URL registry; `dich-vu/apiService.ts` is the typed facade.
- `giao-dien/` — `pages/`, `layouts/`, `components/`; `kho-trang-thai/` — Zustand stores (`khoXacThuc` auth persisted as `auth-storage`, `khoSanPham`, `khoThanhBen` pending badge, `khoChuDe` dark mode, `khoTai` loading).
- `dinh-tuyen/` — routes wrapped in `TuyenBaoVe` with `requiredRoles` and/or `requiredPermission`.

Three call styles coexist (`apiService.*`, use-cases from `linh-vuc`, and raw `apiClient.get/post`). Prefer `apiService` + `API_ENDPOINTS` for new code, and add URLs to `apiEndpoints.ts` rather than inlining them.

Permissions are duplicated client-side in `RealAuthService` (`canDeleteProduct`, `canViewReports`, … → admin-only for product create/delete, reports, user management) and mapped in `khoXacThuc.hasPermission`. These are UI-only; the backend `@VaiTro` decorators are authoritative and sometimes more permissive (e.g. staff *can* create products via the API while the UI hides it). Change both together.

## Frontend architecture (customer — `customer_app`)

Flat and simpler: `pages/`, `components/`, `api/` (`client.ts` axios instance keyed on `localStorage['customer-auth-storage']`, plus `authApi`/`productApi`/`orderApi`), `store/` (`authStore`, `cartStore` persisted as `customer-cart-storage`). No route guards — pages check auth themselves, and guest checkout is supported (`POST /orders/customer` is `@CongKhai()`).

`orderApi.normalizeOrder()` is the adapter for BE↔FE shape drift: `_id → id`, `customerName/Phone/Address → customerInfo`, `total → totalAmount`, `PAID|DEBT|REFUNDED → paid|unpaid|refunded`, plus legacy status mapping. Any new order field consumed by the UI must be added there.

`authApi.setPassword` / `changePassword` / `loginWithPassword` intentionally `throw` — customers have no password login, only OTP (`request-otp` → `verify-otp`).

## Things that will surprise you

- `POST /products` **merges instead of erroring** when the SKU or barcode already exists: it adds the incoming `stock` to the existing product and overwrites descriptive fields.
- `suppliers` (`nha-cung-cap.dieu-khien.ts`) has **no guards at all** — every other controller is JWT+role protected. Public product reads (`GET /products`, `/products/categories`, `/products/:id`) and several customer order endpoints (`POST /orders/customer`, `GET /orders/customer/:id`, `GET /orders/customer/by-phone`, `POST /orders/customer/:id/cancel`) are deliberately `@CongKhai()` to support guest checkout — which also means an order id or phone number is enough to read or cancel someone else's order.
- `DichVuDonHang.findByPhone()` is a stub (`return this.findAll(); /* Tạm */`), so `GET /orders/search/phone/:phone` returns every order regardless of the phone parameter.
- `TrangThaiNhapHang` exports legacy aliases `REQUESTING = 'pending'` and `COMPLETED = 'received'`; comparisons against the raw strings `'completed'`/`'requesting'` appear throughout for old rows.
- Purchases only touch stock when received: `create` never changes stock; `receiveGoods` rewrites `quantity`/`purchasePrice` from the checklist (keeping `orderedQuantity`), creates batches, and pushes the actual price back to `Product.purchasePrice`.
- Selling is blocked when a product has any expired batch — `getProductExpiryStatusMap(7)` is consulted in POS, exchange and customer-order creation, and `deductFEFO` throws again as a backstop. The operator must call `POST /purchases/remove-expired` first.
- Expiry thresholds live in `stock-batch.dich-vu.ts`: `expired < 0 < critical ≤ 7 < near_expiry ≤ 30 < normal` days.
- Purchase recommendations (`goi-y-nhap-hang.dich-vu.ts`) use a hardcoded Vietnamese seasonality table (Tết ×1.3, summer ×1.4, rainy season ×0.9) over 30 days of `completed` orders, with `LEAD_TIME_DAYS = 7` and `SAFETY_STOCK_MULTIPLIER = 1.5`.
- `/shopping-lists` (module `danh-sach-mua-hang`, customer-only) is implemented on the backend and wired into `apiEndpoints.ts`, but **no page in either frontend uses it**.
- `GET /reports/backup` returns a JSON dump of products/orders/purchases, not a real database backup.
- `puppeteer` is a backend dependency but nothing imports it; PDF export uses `pdfkit` and writes ASCII-only labels (no Vietnamese font is embedded).

## Project docs

`back_end_project/documents/` and `front_end_project/documents/` hold pre-existing guides (`USER_GUIDE`, `PERMISSIONS`, `PROJECT_STRUCTURE`, `API_*`). They describe four roles (Admin/Manager/Accountant/Staff) — outdated; the code has three (`admin`, `staff`, `customer`). Trust the code. Analysis docs written for this repo: `GIOI_THIEU_DU_AN.md`, `DE_XUAT_CHUC_NANG.md`, `KIEM_TRA_LUONG_NGHIEP_VU.md`.
