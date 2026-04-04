# Project Overview

> A comprehensive look at what EasyInventory Web is, how it's built, and how it's organized.

[Back to README](../README.md)

---

## Table of Contents

1. [What Is EasyInventory Web?](#what-is-easyinventory-web)
2. [Tech Stack](#tech-stack)
3. [Feature Inventory](#feature-inventory)
4. [Project Structure](#project-structure)
   - [Top-Level Files](#top-level-files)
   - [Source Directory Layout](#source-directory-layout)
   - [Feature Modules](#feature-modules)
   - [Shared Module](#shared-module)
5. [Design Decisions](#design-decisions)

---

## What Is EasyInventory Web?

EasyInventory Web is a single-page application (SPA) that lets retail teams manage their entire inventory workflow from the browser. It is the frontend half of the EasyInventory platform — the backend provides a RESTful API, and this app consumes it.

### Active Features

| Feature | What It Does |
| ------- | ------------ |
| **Products** | Full CRUD for product catalog — name, SKU, category, description. Each product can be linked to one or more suppliers. |
| **Suppliers** | Manage vendor contact details (name, email, phone, notes). Suppliers are linked to products for supply-chain tracking. |
| **Inventory** | Full inventory management — stock products into a store, record receipts and sales, track movement history, manage zone placements, and configure per-item settings (sell price, low-stock threshold, zone assignment). Server-side paginated list with search and category filtering. |
| **Store Layout** | Interactive grid editor for designing store floor plans. Create layout versions with configurable rows × columns, paint inventory zones and fixtures (walls, doors, checkouts, etc.) with freeform cell selection, manage multiple layout versions per store, and activate layouts. |
| **Organization Settings** | Invite team members by email (they receive a Cognito invite), assign roles (Owner, Admin, Employee, Viewer), deactivate/reactivate/remove members. |
| **System Admin** | Platform-wide administration — create new orgs (auto-invites the owner), view all orgs/users, rename/delete orgs, transfer ownership, delete users. |
| **Dashboard** | Role-aware card grid showing every feature the current user can access. Cards for disabled features show "Coming Soon." |
| **Multi-Org Switching** | Users who belong to multiple organizations can switch between them via a dropdown. The selected org ID is sent with every API request. |
| **Authentication** | Login, logout, session persistence, invite/new-password flow, forgot/reset password — all via AWS Cognito. |

### Coming Soon (Placeholder Pages)

| Feature | Stub Location |
| ------- | ------------- |
| **Analytics** | `src/features/analytics/pages/AnalyticsPage.tsx` |

This page exists in the codebase with placeholder UI and is wired into the router and sidebar. Implementing it is as straightforward as replacing the placeholder content with real components.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| ----- | ---------- | ------- | ------- |
| **UI Framework** | [React](https://react.dev/) | 19.x | Component rendering, hooks, context |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type safety, strict mode enabled |
| **Build Tool** | [Vite](https://vite.dev/) | 8.x | Dev server with HMR, production bundler |
| **Routing** | [React Router](https://reactrouter.com/) | 7.x | Client-side routing, nested layouts, route guards |
| **HTTP Client** | [Axios](https://axios-http.com/) | 1.x | API requests with interceptors for auth/org headers |
| **Authentication** | [amazon-cognito-identity-js](https://github.com/aws-amplify/amplify-js) | 6.x | SRP login, session management, password flows |
| **Testing** | [Vitest](https://vitest.dev/) | 4.x | Unit + component tests, jsdom environment |
| **Test Utilities** | [Testing Library](https://testing-library.com/) | 16.x | DOM queries, user-event simulation |
| **Linting** | [ESLint](https://eslint.org/) | 9.x | Flat config with TS, React Hooks, and React Refresh plugins |
| **Styling** | Plain CSS | — | CSS custom properties for theming, BEM naming, co-located files |
| **Production Server** | [Nginx](https://nginx.org/) | Alpine | Serves the static bundle in Docker, handles SPA routing |

### What We Don't Use (and Why)

| Technology | Why Not |
| ---------- | ------- |
| Tailwind | The project uses plain CSS with variables and BEM for clarity and simplicity. |
| CSS-in-JS (styled-components, Emotion) | Adds runtime cost and complexity. Plain CSS with co-located files is sufficient. |
| Sass / Less | The app already uses CSS custom properties for theming. A preprocessor would add tooling without benefit. |
| Redux / Zustand | Three React Contexts (`AuthContext`, `OrgContext`, `StoreContext`) plus custom hooks cover all shared-state needs without a third-party store. |
| Next.js / Remix | The app is a pure SPA backed by a separate API server. Server-side rendering isn't needed. |

---

## Feature Inventory

### Feature Module Structure

Every feature follows the same internal pattern:

```
features/<feature>/
├── api/                 # API functions (calls to backend via apiClient)
│   └── <feature>Api.ts
├── components/          # UI components specific to this feature
│   ├── index.ts         # Barrel export
│   ├── MyComponent.tsx
│   └── MyComponent.css
├── constants/           # Feature-specific constants (optional)
│   ├── index.ts
│   └── <domain>.ts
├── context/             # React Context (if the feature needs shared state)
│   ├── <Feature>Context.tsx    # Provider component
│   ├── <feature>-context.ts    # Context definition + types
│   └── use<Feature>.ts         # Consumer hook
├── hooks/               # Custom hooks for complex state management (optional)
│   ├── index.ts
│   └── use<Feature>Editor.ts
├── pages/               # Route-level page components
│   ├── <Feature>Page.tsx
│   └── <Feature>Page.css
├── utils/               # Feature-specific utility functions (optional)
│   ├── index.ts
│   └── <domain>.ts
└── __tests__/           # Tests (at component or context level)
```

Not every feature has all folders. Simpler features skip `context/`, `hooks/`, `constants/`, or `utils/`. More complex features like `store-layout` use all of them.

#### Shared CSS Pattern

When multiple components within a feature share the same visual patterns, CSS is consolidated into shared stylesheets rather than duplicated per-component:

- **`layout-modal.css`** — shared modal styles (overlay, dialog, header, form fields, buttons, type pickers, delete confirmations) used by all store-layout modal components
- **`action-bar.css`** — shared action-bar styles (banner layout, text, buttons) used by FreeformBar and EditBanner
- **`RecordMovementModal.css`** — shared modal styles for inventory receipt and sale modals (overlay, dialog, header, context card, form fields, footer buttons) used by RecordReceiptModal and RecordSaleModal

Components import the shared stylesheet directly instead of maintaining their own CSS file. This reduces duplication and keeps styling consistent.

### Full Feature Matrix

| Feature | Status | API File | Components | Context | Pages |
| ------- | ------ | -------- | ---------- | ------- | ----- |
| `admin` | Active | `adminApi.ts` | CreateOrgForm, OrgTable, UserTable, DeleteOrgModal, RenameOrgModal, TransferOwnershipModal, DeleteUserModal, OrgMembersModal | — | AdminPage |
| `analytics` | Placeholder | — | — | — | AnalyticsPage |
| `auth` | Active | `cognito-service.ts` | ProtectedRoute, RequireOrg, RoleRoute | AuthContext, auth-reducer, useAuth | LoginPage, ForgotPasswordPage, ResetPasswordPage |
| `dashboard` | Active | — | — | — | DashboardPage |
| `inventory` | Active | `inventoryApi.ts` | StockBadge, InventoryTable, StockProductModal, RecordReceiptModal, RecordSaleModal, MovementHistory, PlacementHistory | — | InventoryPage, InventoryDetailPage |
| `org` | Active | `orgApi.ts` | InviteForm, MemberList, MemberRow | OrgContext, useOrg | OrgSettingsPage |
| `products` | Active | `productApi.ts` | ProductTable, ProductForm, ProductSupplierTable, AddSupplierModal | — | ProductListPage, ProductDetailPage, ProductFormPage |
| `store-layout` | Active | `storeApi.ts` | CreateLayoutForm, LayoutGrid, LayoutObjectsPanel, ModeToolbar, VersionSelector, ZoneNameModal, ZoneDetailModal, FixtureNameModal, FixtureDetailModal, FreeformBar, EditBanner | `StoreContext`, `store-context`, `useStore` | StoreLayoutPage |
| `suppliers` | Active | `supplierApi.ts` | SupplierForm, SupplierSearchSelect | — | SuppliersPage |

---

## Project Structure

### Top-Level Files

```
├── Dockerfile           # Dev container — runs Vite dev server
├── Dockerfile.web       # Production container — multi-stage Node build + Nginx
├── nginx.conf           # Nginx config for SPA routing + asset caching
├── index.html           # HTML entry point — loads /src/app/main.tsx
├── package.json         # Dependencies + npm scripts
├── package-lock.json    # Locked dependency versions
├── tsconfig.json        # Root TS config — references app, node, and test configs
├── tsconfig.app.json    # TS config for app source (strict mode)
├── tsconfig.node.json   # TS config for Node files (vite.config.ts)
├── tsconfig.test.json   # TS config for tests (relaxed unused-var rules)
├── vite.config.ts       # Vite + Vitest configuration
├── eslint.config.js     # ESLint flat config (TS + React Hooks + React Refresh)
├── .env.example         # Template for environment variables
├── .gitignore           # Git ignore rules
├── docs/                # Documentation (you are here)
├── public/              # Static files copied to dist/ at build time
└── src/                 # Application source code
```

### Source Directory Layout

```
src/
├── app/                 # Application shell
│   ├── main.tsx         # Entry point — renders <App /> into #root
│   ├── App.tsx          # BrowserRouter + all route definitions
│   ├── index.css        # Global reset, CSS variables, shared utility classes
│   ├── App.css          # App-level styles
│   ├── NotFoundPage.tsx # 404 catch-all page
│   └── __tests__/       # App-level tests
│
├── features/            # Feature modules (domain-driven)
│   ├── admin/           # System admin (create orgs, manage users)
│   ├── analytics/       # Analytics page (placeholder)
│   ├── auth/            # Authentication (Cognito, login, password flows)
│   ├── dashboard/       # Dashboard page
│   ├── inventory/       # Inventory management (list, detail, modals)
│   ├── org/             # Organization settings (invite, roles, members)
│   ├── products/        # Product CRUD + supplier linking
│   ├── store-layout/    # Store layout grid editor + store context
│   └── suppliers/       # Supplier CRUD
│
├── shared/              # Cross-cutting code used by all features
│   ├── api/             # Axios client + interceptors
│   ├── components/      # Shared UI + layout components
│   ├── constants/       # Role enums, navigation config, icons
│   ├── hooks/           # Reusable React hooks
│   ├── types/           # Shared TypeScript interfaces
│   └── utils/           # Error handling + formatting helpers
│
├── assets/              # Static assets (images, etc.)
└── test/                # Test infrastructure
    └── setup.ts         # Imports jest-dom matchers for Vitest
```

### Shared Module

| Folder | Contents |
| ------ | -------- |
| `shared/api/` | `client.ts` — single Axios instance with auth token + org ID interceptors |
| `shared/components/layout/` | `AppLayout` (sidebar + content outlet), `Sidebar` (nav + user info + collapse), `PageHeader` (title/subtitle/back/actions), `OrgSwitcher` (multi-org dropdown), `StoreSwitcher` (per-org store dropdown), `AuthLayout` (split-screen branding) |
| `shared/components/ui/` | `LoadingState`, `ErrorBanner`, `SuccessBanner`, `EmptyState`, `ErrorBoundary`, `Pagination` |
| `shared/components/heatmap/` | `HeatmapGrid` (metric-agnostic store layout heatmap), `HeatmapDetailPanel` (composable right-side detail panel), `HeatmapLegend` (color scale bar), `stockHealthColorScale` (predefined green→red color scale) |
| `shared/constants/` | `roles.ts` (role enums + helper functions), `navigation.tsx` (nav item config array), `nav-icons.tsx` (inline SVG icon components) |
| `shared/hooks/` | `useApiData` (data fetching on mount), `useAsyncAction` (user-triggered mutations), `usePagination` (client-side table pagination) |
| `shared/types/` | `auth.ts`, `org.ts`, `admin.ts`, `product.ts`, `supplier.ts`, `store.ts` (stores, layouts, zones, fixtures, cells), `inventory.ts` (inventory items, movements, placements, pagination), `heatmap.ts` (heatmap zones, fixtures, grid config, color scales) + `index.ts` barrel |
| `shared/utils/` | `errors.ts` (`extractApiError`), `format.ts` (`formatDate`, `formatRoleLabel`) + `index.ts` barrel |

---

## Design Decisions

### Why Feature-Based Folder Structure?

Code is organized by **domain feature**, not by technical role. Instead of a flat `components/` and `pages/` tree, each feature owns its own API, components, context, and pages. This keeps related code close together and makes it easy to find everything related to a given feature.

### Why Plain CSS?

The project uses plain CSS with CSS custom properties (variables) defined in `src/app/index.css`. Each component has a co-located `.css` file. This approach is simple, has zero runtime cost, requires no build plugins, and is easy for any developer to understand. Class names follow BEM conventions (`.block__element--modifier`).

### Why Two Dockerfiles?

- **`Dockerfile`** — development container. Runs the Vite dev server with HMR inside Docker for consistent team environments.
- **`Dockerfile.web`** — production container. Multi-stage build: Node compiles the app (with `VITE_*` build args baked in), then Nginx serves the static bundle. This separates build-time from runtime concerns.

### Why `useReducer` for Auth?

The authentication flow has many states (loading, logged out, needs new password, logged in, error). A `useReducer` with a union-typed action set makes every state transition explicit and testable, compared to scattered `useState` calls.

### Why No Global State Library?

Three React Contexts (`AuthContext` for user + token, `OrgContext` for org membership selection, `StoreContext` for store selection) cover all shared state. Feature-local state is managed with `useState`. Custom hooks (`useApiData`, `useAsyncAction`) encapsulate data-fetching patterns. There's nothing that needs a full state management library.
