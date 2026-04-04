# API Reference

> Every backend endpoint consumed by the EasyInventory Web frontend, organized by domain, with request/response types.

[Back to README](../README.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Common Headers](#common-headers)
3. [Error Response Format](#error-response-format)
4. [Auth & Profile](#auth--profile)
5. [Organization Members](#organization-members)
6. [Products](#products)
7. [Product–Supplier Links](#productsupplier-links)
8. [Suppliers](#suppliers)
9. [Stores](#stores)
10. [Store Layout Versions](#store-layout-versions)
11. [Layout Zones](#layout-zones)
12. [Layout Fixtures](#layout-fixtures)
13. [Store Inventory](#store-inventory)
14. [Inventory Movements](#inventory-movements)
15. [Inventory Placements](#inventory-placements)
16. [System Admin — Organizations](#system-admin--organizations)
17. [System Admin — Users](#system-admin--users)
18. [TypeScript Types Reference](#typescript-types-reference)

---

## Overview

All endpoints are relative to the `VITE_API_URL` base URL (default: `http://localhost:8000`).

The frontend uses a single Axios instance (`shared/api/client.ts`) that automatically attaches authentication and org headers to every request. Feature API files (`productApi.ts`, `supplierApi.ts`, etc.) provide typed wrappers around these HTTP calls.

---

## Common Headers

| Header | Value | Set By | Description |
| ------ | ----- | ------ | ----------- |
| `Authorization` | `Bearer <jwt-token>` | Request interceptor | JWT access token from Cognito |
| `X-Org-Id` | `<org-uuid>` | Request interceptor | Currently selected organization ID |
| `Content-Type` | `application/json` | Axios default | Request body format |

Both headers are added automatically by the Axios request interceptor in `shared/api/client.ts`. You never need to set them manually in API calls.

---

## Error Response Format

The backend returns errors in this format:

```json
{
  "detail": "Human-readable error message"
}
```

The frontend's `extractApiError()` utility (`shared/utils/errors.ts`) pulls the `detail` field from the response. If no `detail` is present, it falls back to `error.message` or a generic "An unexpected error occurred."

---

## Auth & Profile

Authentication is handled client-side through AWS Cognito (not via the backend API). The backend provides a profile endpoint for fetching the user's profile after authentication.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/auth/profile` | Get the authenticated user's profile | — | `UserProfile` |

### Types

```typescript
interface UserProfile {
  id: string;
  email: string;
  systemRole: 'SYSTEM_ADMIN' | 'USER';
  memberships: OrgMembership[];
}

interface OrgMembership {
  orgId: string;
  orgName: string;
  role: OrgRole;        // 'OWNER' | 'ADMIN' | 'EMPLOYEE' | 'VIEWER'
  status: string;       // 'ACTIVE' | 'INVITED' | 'DEACTIVATED'
}
```

---

## Organization Members

Manage members within the currently selected organization.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/orgs/{orgId}/members` | List all members of the org | — | `OrgMember[]` |
| `POST` | `/orgs/{orgId}/members/invite` | Invite a new member by email | `InviteRequest` | `OrgMember` |
| `PUT` | `/orgs/{orgId}/members/{userId}/role` | Change a member's role | `UpdateRoleRequest` | `OrgMember` |
| `PUT` | `/orgs/{orgId}/members/{userId}/deactivate` | Deactivate a member | — | `OrgMember` |
| `PUT` | `/orgs/{orgId}/members/{userId}/reactivate` | Reactivate a member | — | `OrgMember` |
| `DELETE` | `/orgs/{orgId}/members/{userId}` | Remove a member from the org | — | — |

### Types

```typescript
interface OrgMember {
  id: string;
  email: string;
  role: OrgRole;        // 'OWNER' | 'ADMIN' | 'EMPLOYEE' | 'VIEWER'
  status: string;       // 'ACTIVE' | 'INVITED' | 'DEACTIVATED'
  joinedAt: string;
}

interface InviteRequest {
  email: string;
  role: OrgRole;
}

interface UpdateRoleRequest {
  role: OrgRole;
}
```

---

## Products

Full CRUD for the product catalog within the selected organization.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/products` | List all products | — | `Product[]` |
| `GET` | `/products/{id}` | Get a single product with suppliers | — | `ProductWithSuppliers` |
| `POST` | `/products` | Create a new product | `ProductCreateRequest` | `Product` |
| `PUT` | `/products/{id}` | Update a product | `ProductUpdateRequest` | `Product` |
| `DELETE` | `/products/{id}` | Delete a product | — | — |

### Types

```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductWithSuppliers extends Product {
  suppliers: ProductSupplierLink[];
}

interface ProductCreateRequest {
  name: string;
  sku: string;
  category?: string;
  description?: string;
}

interface ProductUpdateRequest {
  name?: string;
  sku?: string;
  category?: string;
  description?: string;
}
```

---

## Product–Supplier Links

Manage the many-to-many relationship between products and suppliers.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/products/{productId}/suppliers` | List suppliers linked to a product | — | `ProductSupplierLink[]` |
| `POST` | `/products/{productId}/suppliers` | Link a supplier to a product | `LinkSupplierRequest` | `ProductSupplierLink` |
| `DELETE` | `/products/{productId}/suppliers/{supplierId}` | Unlink a supplier from a product | — | — |

### Types

```typescript
interface ProductSupplierLink {
  id: string;
  supplierId: string;
  supplierName: string;
  linkedAt: string;
}

interface LinkSupplierRequest {
  supplierId: string;
}
```

---

## Suppliers

Full CRUD for supplier contacts within the selected organization.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/suppliers` | List all suppliers | — | `Supplier[]` |
| `GET` | `/suppliers/{id}` | Get a single supplier | — | `Supplier` |
| `POST` | `/suppliers` | Create a new supplier | `SupplierCreateRequest` | `Supplier` |
| `PUT` | `/suppliers/{id}` | Update a supplier | `SupplierUpdateRequest` | `Supplier` |
| `DELETE` | `/suppliers/{id}` | Delete a supplier | — | — |

### Types

```typescript
interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierCreateRequest {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface SupplierUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}
```

---

## Stores

List physical store locations within the currently selected organization. The selected `store_id` is read from `StoreContext` by downstream pages and passed explicitly in their API calls.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/api/stores` | List all stores for the current org | — | `Store[]` |

### Types

```typescript
interface Store {
  id: string;
  name: string;
  org_id: string;
  created_at: string;
}
```

> **Note:** The stores list is scoped to the org identified by the `X-Org-Id` header, which is automatically injected by the Axios request interceptor.

---

## Store Layout Versions

Manage layout versions for a store. Each store can have multiple layout versions, but only one is active at a time. Layout responses include nested `zones` and `fixtures` arrays, so no separate GET endpoints are needed for those resources.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/api/stores/{storeId}/layouts` | List all layout versions for a store | — | `StoreLayout[]` |
| `POST` | `/api/stores/{storeId}/layouts` | Create a new layout version | `{ rows: number, cols: number }` | `StoreLayout` |
| `POST` | `/api/stores/{storeId}/layouts/{layoutId}/activate` | Activate a layout version | — | `StoreLayout` |

### Types

```typescript
interface StoreLayout {
  id: string;
  store_id: string;
  version_number: number;
  rows: number;
  cols: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  zones: LayoutZone[];       // Nested — no separate GET needed
  fixtures: LayoutFixture[]; // Nested — no separate GET needed
}

interface Cell {
  row: number;
  col: number;
}
```

---

## Layout Zones

Manage inventory zones within a specific layout version. Zones represent logical areas of the store floor plan (e.g., "Produce", "Electronics"). Each zone owns a set of grid cells and has a color for visual identification.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `POST` | `/api/stores/{storeId}/layouts/{layoutId}/zones` | Create a new zone | `ZoneCreateRequest` | `LayoutZone` |
| `PUT` | `/api/stores/{storeId}/layouts/{layoutId}/zones/{zoneId}` | Update a zone | `ZoneUpdateRequest` | `LayoutZone` |
| `DELETE` | `/api/stores/{storeId}/layouts/{layoutId}/zones/{zoneId}` | Delete a zone | — | — |

### Types

```typescript
interface LayoutZone {
  id: string;
  layout_version_id: string;
  name: string;
  color: string;             // Hex color (e.g., "#3B82F6")
  cells: Cell[];             // Grid cells belonging to this zone
  is_freeform?: boolean;     // True if the zone shape is non-rectangular
  created_at: string;
  updated_at: string;
}

interface ZoneCreateRequest {
  name: string;
  color: string;
  cells: Cell[];
  is_freeform?: boolean;
}

interface ZoneUpdateRequest {
  name?: string;
  color?: string;
  cells?: Cell[];
}
```

---

## Layout Fixtures

Manage fixtures and structural elements within a specific layout version. Fixtures represent physical structures in the store (walls, checkout counters, doors, pillars, etc.). Each fixture has a type that determines its visual representation.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `POST` | `/api/stores/{storeId}/layouts/{layoutId}/fixtures` | Create a new fixture | `FixtureCreateRequest` | `LayoutFixture` |
| `PUT` | `/api/stores/{storeId}/layouts/{layoutId}/fixtures/{fixtureId}` | Update a fixture | `FixtureUpdateRequest` | `LayoutFixture` |
| `DELETE` | `/api/stores/{storeId}/layouts/{layoutId}/fixtures/{fixtureId}` | Delete a fixture | — | — |

### Types

```typescript
type FixtureType =
  | 'WALL'
  | 'CHECKOUT'
  | 'FRONT_DESK'
  | 'DOOR'
  | 'PILLAR'
  | 'RESTROOM'
  | 'STORAGE'
  | 'STAIRS';

interface LayoutFixture {
  id: string;
  layout_version_id: string;
  zone_id?: string;          // Optional link to a zone
  name: string;
  fixture_type: FixtureType;
  cells: Cell[];             // Grid cells occupied by this fixture
  created_at: string;
  updated_at: string;
}

interface FixtureCreateRequest {
  name: string;
  fixture_type: FixtureType;
  cells: Cell[];
  zone_id?: string;
}

interface FixtureUpdateRequest {
  name?: string;
  fixture_type?: FixtureType;
  cells?: Cell[];
  zone_id?: string;
}
```

---

## Store Inventory

Manage inventory entries for a specific store. Each entry links a product to a store with quantity, sell price, and low-stock threshold. The list endpoint supports server-side pagination with search and category filtering.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/api/stores/{storeId}/inventory` | List inventory entries (paginated) | — | `PaginatedInventoryResponse` |
| `GET` | `/api/stores/{storeId}/inventory/{entryId}` | Get a single inventory entry | — | `StoreInventoryItem` |
| `POST` | `/api/stores/{storeId}/inventory` | Stock a product in this store | `StockProductRequest` | `StoreInventoryItem` |
| `PATCH` | `/api/stores/{storeId}/inventory/{entryId}` | Update entry settings | `UpdateInventoryRequest` | `StoreInventoryItem` |
| `DELETE` | `/api/stores/{storeId}/inventory/{entryId}` | Deactivate/delete an entry | — | — |

### Query Parameters (List)

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `search` | `string` | Filter by product name or category (optional) |
| `category` | `string` | Filter by exact category match (optional) |
| `page` | `number` | Page number, 1-based (default: 1) |
| `page_size` | `number` | Items per page (default: 10) |

### Types

```typescript
interface InventoryProductSummary {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
}

interface StoreInventoryItem {
  id: string;
  store_id: string;
  product_id: string;
  quantity: number;
  unit_price: string | null;        // Decimal string (e.g. "2.9900")
  low_stock_threshold: number | null;
  created_at: string;
  updated_at: string;
  product: InventoryProductSummary;  // Embedded product summary
}

interface PaginatedInventoryResponse {
  items: StoreInventoryItem[];
  total: number;
  page: number;
  page_size: number;
}

interface StockProductRequest {
  product_id: string;
  quantity?: number;
  unit_price?: string | null;
  low_stock_threshold?: number | null;
}

interface UpdateInventoryRequest {
  quantity?: number;
  unit_price?: string | null;
  low_stock_threshold?: number | null;
}
```

---

## Inventory Movements

Record receipts (inbound stock) and sales (outbound stock) for an inventory entry. Each movement adjusts the entry's quantity.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `POST` | `/api/stores/{storeId}/inventory/{entryId}/receipts` | Record a receipt (add stock) | `RecordReceiptRequest` | `InventoryMovement` |
| `POST` | `/api/stores/{storeId}/inventory/{entryId}/sales` | Record a sale (remove stock) | `RecordSaleRequest` | `InventoryMovement` |
| `GET` | `/api/stores/{storeId}/inventory/{entryId}/movements` | List movement history | — | `InventoryMovement[]` |

> **⚠️ Backend Blocker:** The `GET .../movements` endpoint does not exist on the backend yet. The frontend’s `MovementHistory` component handles the resulting 404 gracefully with an error banner.

### Types

```typescript
type MovementType = 'receipt' | 'sale';

interface RecordReceiptRequest {
  quantity: number;
  unit_cost?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}

interface RecordSaleRequest {
  quantity: number;
  unit_price?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}

interface InventoryMovement {
  id: string;
  store_inventory_id: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost: string | null;
  unit_price: string | null;
  reference_number: string | null;
  notes: string | null;
  performed_by_user_id: string;
  created_at: string;
}
```

---

## Inventory Placements

Manage zone assignments for inventory entries. Each entry can be placed in one zone at a time. Assigning a new zone ends the previous placement automatically.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/api/stores/{storeId}/inventory/{entryId}/placements` | List placement history | — | `InventoryPlacement[]` |
| `PATCH` | `/api/stores/{storeId}/inventory/{entryId}/placements` | Assign to a zone | `AssignZoneRequest` | `InventoryPlacement` |
| `DELETE` | `/api/stores/{storeId}/inventory/{entryId}/placements/current` | Remove from current zone | — | — |

### Types

```typescript
interface InventoryPlacement {
  id: string;
  store_inventory_id: string;
  zone_id: string;
  zone_name: string;
  started_at: string;
  ended_at: string | null;
  placed_by_user_id: string;
  duration_display: string | null;
  created_at: string;
}

interface AssignZoneRequest {
  active_zone_id: string;
}
```

---

## System Admin — Organizations

Platform-wide organization management. Requires `SYSTEM_ADMIN` system role.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/admin/orgs` | List all organizations | — | `OrgListItem[]` |
| `POST` | `/admin/orgs` | Create a new organization | `CreateOrgRequest` | `OrgListItem` |
| `PUT` | `/admin/orgs/{orgId}` | Rename an organization | `RenameOrgRequest` | `OrgListItem` |
| `DELETE` | `/admin/orgs/{orgId}` | Delete an organization | — | — |
| `GET` | `/admin/orgs/{orgId}/members` | List members of any org | — | `OrgMember[]` |
| `POST` | `/admin/orgs/{orgId}/transfer-ownership` | Transfer org ownership | `TransferOwnershipRequest` | — |

### Types

```typescript
interface OrgListItem {
  id: string;
  name: string;
  ownerEmail: string;
  memberCount: number;
  createdAt: string;
}

interface CreateOrgRequest {
  name: string;
  ownerEmail: string;
}

interface RenameOrgRequest {
  name: string;
}

interface TransferOwnershipRequest {
  newOwnerUserId: string;
}
```

---

## System Admin — Users

Platform-wide user management. Requires `SYSTEM_ADMIN` system role.

| Method | Endpoint | Description | Request Body | Response |
| ------ | -------- | ----------- | ------------ | -------- |
| `GET` | `/admin/users` | List all users | — | `UserListItem[]` |
| `DELETE` | `/admin/users/{userId}` | Delete a user account | — | — |

### Types

```typescript
interface UserListItem {
  id: string;
  email: string;
  systemRole: 'SYSTEM_ADMIN' | 'USER';
  status: string;
  createdAt: string;
}
```

---

## TypeScript Types Reference

All request/response types are defined in `src/shared/types/` and exported through a barrel file:

| File | Types Exported |
| ---- | -------------- |
| `auth.ts` | `AuthUser`, `UserProfile` |
| `org.ts` | `OrgMember`, `OrgMembership`, `InviteRequest`, `UpdateRoleRequest` |
| `product.ts` | `Product`, `ProductWithSuppliers`, `ProductSupplierLink`, `ProductCreateRequest`, `ProductUpdateRequest`, `LinkSupplierRequest` |
| `supplier.ts` | `Supplier`, `SupplierCreateRequest`, `SupplierUpdateRequest` |
| `store.ts` | `Store`, `StoreLayout`, `Cell`, `LayoutZone`, `ZoneCreateRequest`, `ZoneUpdateRequest`, `LayoutFixture`, `FixtureType`, `FixtureCreateRequest`, `FixtureUpdateRequest`, `ZoneColorDef`, `FixtureTypeDef` |
| `inventory.ts` | `StoreInventoryItem`, `InventoryProductSummary`, `PaginatedInventoryResponse`, `StockProductRequest`, `UpdateInventoryRequest`, `RecordReceiptRequest`, `RecordSaleRequest`, `InventoryMovement`, `MovementType`, `InventoryPlacement`, `AssignZoneRequest` |
| `heatmap.ts` | `HeatmapZone`, `HeatmapFixture`, `HeatmapGridConfig`, `HeatmapColorScale` |
| `admin.ts` | `OrgListItem`, `CreateOrgRequest`, `RenameOrgRequest`, `TransferOwnershipRequest`, `UserListItem` |
| `index.ts` | Re-exports all of the above |

Import types from the barrel:

```tsx
import type { Product, Supplier, OrgMember } from '@/shared/types';
```
