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
9. [System Admin — Organizations](#system-admin--organizations)
10. [System Admin — Users](#system-admin--users)
11. [TypeScript Types Reference](#typescript-types-reference)

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
| `admin.ts` | `OrgListItem`, `CreateOrgRequest`, `RenameOrgRequest`, `TransferOwnershipRequest`, `UserListItem` |
| `index.ts` | Re-exports all of the above |

Import types from the barrel:

```tsx
import type { Product, Supplier, OrgMember } from '@/shared/types';
```
