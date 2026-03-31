# Developer Guide

> Coding conventions, patterns, testing practices, and a step-by-step walkthrough for adding new features to EasyInventory Web.

[Back to README](../README.md)

---

## Table of Contents

1. [TypeScript Conventions](#typescript-conventions)
2. [CSS Standards](#css-standards)
3. [File Naming](#file-naming)
4. [Data Fetching Patterns](#data-fetching-patterns)
   - [useApiData — Read Data on Mount](#useapidata--read-data-on-mount)
   - [useAsyncAction — User-Triggered Mutations](#useasyncaction--user-triggered-mutations)
   - [usePagination — Client-Side Table Paging](#usepagination--client-side-table-paging)
5. [Error Handling](#error-handling)
6. [UI Feedback Components](#ui-feedback-components)
7. [Roles & Constants](#roles--constants)
8. [How to Add a New Feature](#how-to-add-a-new-feature)
9. [Testing](#testing)
   - [Running Tests](#running-tests)
   - [Test Configuration](#test-configuration)
   - [Writing Tests](#writing-tests)
   - [Mocking API Calls](#mocking-api-calls)
   - [Test File Locations](#test-file-locations)
10. [PR Review Checklist](#pr-review-checklist)

---

## TypeScript Conventions

The project uses **strict TypeScript** with these compiler flags enabled:

- `strict: true` — enables all strict checks
- `noUnusedLocals: true` — errors on unused variables
- `noUnusedParameters: true` — errors on unused function parameters
- `noFallthroughCasesInSwitch: true` — errors on switch fallthrough

### Rules to Follow

| Rule | Example |
| ---- | ------- |
| Always type function parameters and return values | `function getUser(id: string): Promise<User>` |
| Use interfaces for object shapes | `interface Product { id: string; name: string; }` |
| Export types from `shared/types/` and import through the barrel | `import { Product } from '@/shared/types'` |
| Prefer `const` over `let`; never use `var` | `const items = await fetchItems()` |
| Use union types for state variables with known values | `type Status = 'idle' \| 'loading' \| 'error' \| 'success'` |
| Use the `as const` assertion for literal tuples | `const roles = ['admin', 'viewer'] as const` |

### Path Aliases

The project defines `@/` as an alias for `src/` (configured in both `tsconfig.app.json` and `vite.config.ts`). Always import using this alias instead of relative paths:

```tsx
// ✅ Good
import { useAuth } from '@/features/auth/context/useAuth';
import { Product } from '@/shared/types';

// ❌ Bad
import { useAuth } from '../../../auth/context/useAuth';
```

---

## CSS Standards

### General Rules

- **Plain CSS only** — no Sass, Less, Tailwind, or CSS-in-JS.
- **Co-located files** — every `.tsx` component that needs styles has a matching `.css` file in the same directory.
- **Shared stylesheets** — when multiple components share the same visual patterns (e.g., modals, action bars), extract a shared `.css` file instead of duplicating styles. Components import the shared file directly.
- **BEM naming** — use `.block__element--modifier` for class names.
- **CSS custom properties** — all theme variables (colors, spacing, radii, shadows) are defined in `src/app/index.css` and referenced throughout.

### Example

```css
/* ProductTable.css */
.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table__header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.product-table__row--selected {
  background: var(--color-primary-light);
}
```

```tsx
// ProductTable.tsx
import './ProductTable.css';

export function ProductTable() {
  return (
    <table className="product-table">
      <thead className="product-table__header">...</thead>
    </table>
  );
}
```

### Theme Variables

Global CSS variables live in `src/app/index.css`. Common variables include:

```css
:root {
  --color-primary: ...;
  --color-surface: ...;
  --color-border: ...;
  --color-text: ...;
  --color-error: ...;
  --color-success: ...;
  --radius-sm: ...;
  --radius-md: ...;
  --shadow-sm: ...;
  --shadow-md: ...;
}
```

Always use these variables instead of hardcoding colors or sizes.

---

## File Naming

| Type | Convention | Example |
| ---- | ---------- | ------- |
| React components | PascalCase | `ProductTable.tsx` |
| CSS files | Match the component | `ProductTable.css` |
| Hooks | camelCase with `use` prefix | `useApiData.ts` |
| Context files | camelCase with kebab or PascalCase | `auth-context.ts`, `AuthContext.tsx` |
| API files | camelCase with `Api` suffix | `productApi.ts` |
| Type files | camelCase | `product.ts` |
| Test files | Match source + `.test` | `useApiData.test.ts` |
| Barrel exports | `index.ts` | `index.ts` |
| Constants | camelCase or kebab-case | `roles.ts`, `nav-icons.tsx` |
| Pages | PascalCase with `Page` suffix | `ProductListPage.tsx` |

---

## Data Fetching Patterns

The project provides three custom hooks in `shared/hooks/` that standardize how components interact with the API.

### useApiData — Read Data on Mount

Use this for **fetching data when a component mounts** (GET requests).

```tsx
const { data, loading, error, refetch } = useApiData<Product[]>(
  () => productApi.list(),    // API function to call
  []                           // dependency array — refetch when these change
);
```

**Returns:**

| Property | Type | Description |
| -------- | ---- | ----------- |
| `data` | `T \| null` | The fetched data, or `null` if not yet loaded |
| `loading` | `boolean` | `true` while the request is in flight |
| `error` | `string \| null` | Error message if the request failed |
| `refetch` | `() => void` | Call to manually re-run the fetch |

**Typical usage in a page:**

```tsx
function ProductListPage() {
  const { data: products, loading, error, refetch } = useApiData<Product[]>(
    () => productApi.list(),
    []
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorBanner message={error} />;
  if (!products?.length) return <EmptyState message="No products yet." />;

  return <ProductTable products={products} />;
}
```

### useAsyncAction — User-Triggered Mutations

Use this for **actions the user triggers** (POST, PUT, DELETE).

```tsx
const { execute, loading, error, success } = useAsyncAction<void>(
  async () => { await productApi.delete(id); }
);
```

**Returns:**

| Property | Type | Description |
| -------- | ---- | ----------- |
| `execute` | `(...args) => Promise<T>` | Call to trigger the action |
| `loading` | `boolean` | `true` while the action is running |
| `error` | `string \| null` | Error message if the action failed |
| `success` | `boolean` | `true` after the action completes successfully |

**Typical usage:**

```tsx
function DeleteButton({ productId, onDeleted }: Props) {
  const { execute, loading, error } = useAsyncAction(async () => {
    await productApi.delete(productId);
    onDeleted();
  });

  return (
    <>
      {error && <ErrorBanner message={error} />}
      <button onClick={execute} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </>
  );
}
```

### usePagination — Client-Side Table Paging

Use this for **paginating arrays of data** on the client.

```tsx
const {
  paginatedItems,
  currentPage,
  totalPages,
  pageSize,
  setCurrentPage,
  setPageSize,
} = usePagination(allProducts, { defaultPageSize: 25 });
```

**Returns:**

| Property | Type | Description |
| -------- | ---- | ----------- |
| `paginatedItems` | `T[]` | The slice of items for the current page |
| `currentPage` | `number` | Current page number (1-based) |
| `totalPages` | `number` | Total number of pages |
| `pageSize` | `number` | Items per page |
| `setCurrentPage` | `(page: number) => void` | Navigate to a specific page |
| `setPageSize` | `(size: number) => void` | Change items per page (resets to page 1) |

Pair with the `<Pagination />` UI component for a complete table paging solution.

### Complex State: Custom Hook Extraction

When a page component accumulates many state variables (10+) and handlers, extract them into a custom hook to keep the page focused on orchestration and rendering.

**Pattern:** `use<Feature>Editor`

The `useLayoutEditor` hook in the store-layout feature demonstrates this pattern. It encapsulates ~15 state variables, derived values, and handlers for the grid editor:

```tsx
// hooks/useLayoutEditor.ts
export function useLayoutEditor(
  zoneList: LayoutZone[],
  fixtureList: LayoutFixture[],
): LayoutEditorState {
  // State groups
  const [placementMode, setPlacementMode] = useState<PlacementMode>("none");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  // ... more state

  // Derived values via useMemo
  const editingName = useMemo(() => { /* ... */ }, [editingId]);
  const hintText = useMemo(() => { /* ... */ }, [placementMode, editingId]);

  // Handlers
  const handlePlacementModeChange = useCallback(/* ... */);
  const handleItemClick = useCallback(/* ... */);

  // Reset helpers for consistent state cleanup after CRUD
  const resetAfterCreate = useCallback(/* ... */);
  const resetAfterDelete = useCallback(/* ... */);

  return { placementMode, selectedItemId, hintText, /* ... */ };
}
```

```tsx
// pages/StoreLayoutPage.tsx — clean orchestration
function StoreLayoutPage() {
  const editor = useLayoutEditor(zoneList, fixtureList);
  const createZoneAction = useAsyncAction(async (body) => {
    await createZone(storeId, layoutId, body);
    editor.resetAfterCreate();
    refetchLayouts();
  });
  // ... render using editor.* values and handlers
}
```

**When to extract:**
- The page has 10+ `useState` calls
- Multiple handlers need to coordinate resets across several state variables
- Derived values (`useMemo`) depend on combinations of the state variables
- The page file exceeds ~300 lines

**What stays in the page:**
- API calls (`useApiData`, `useAsyncAction`)
- Data fetching and refetch orchestration
- JSX rendering

---

## Error Handling

### extractApiError

The utility function `extractApiError` (in `shared/utils/errors.ts`) standardizes error extraction from Axios responses:

```tsx
import { extractApiError } from '@/shared/utils/errors';

try {
  await productApi.create(data);
} catch (err) {
  const message = extractApiError(err);
  // message is a user-friendly string like "Product with this SKU already exists"
}
```

The function checks `error.response.data.detail` first (the backend's standard error format), then falls back to `error.message`, and finally to a generic string.

### Error Display Pattern

```tsx
{error && <ErrorBanner message={error} />}
```

Both `useApiData` and `useAsyncAction` run errors through `extractApiError` internally, so the `error` property they return is already a clean string ready to display.

---

## UI Feedback Components

The `shared/components/ui/` directory provides standardized feedback components:

| Component | Import | Purpose |
| --------- | ------ | ------- |
| `LoadingState` | `@/shared/components/ui/LoadingState` | Spinner with optional message for loading states |
| `ErrorBanner` | `@/shared/components/ui/ErrorBanner` | Red banner for error messages |
| `SuccessBanner` | `@/shared/components/ui/SuccessBanner` | Green banner for success messages |
| `EmptyState` | `@/shared/components/ui/EmptyState` | Placeholder for empty data sets |
| `ErrorBoundary` | `@/shared/components/ui/ErrorBoundary` | Class component that catches render errors |
| `Pagination` | `@/shared/components/ui/Pagination` | Page navigation controls for tables |

**Usage pattern for a typical list page:**

```tsx
if (loading) return <LoadingState />;
if (error) return <ErrorBanner message={error} />;
if (!data?.length) return <EmptyState message="Nothing here yet." />;

return (
  <>
    <DataTable items={paginatedItems} />
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  </>
);
```

---

## Roles & Constants

### Role Helpers

`shared/constants/roles.ts` exports enums and helper functions:

```tsx
import { SystemRole, OrgRole, isOrgOwner, isOrgAdmin, hasMinRole } from '@/shared/constants/roles';

// Check specific roles
if (isOrgOwner(member.role)) { /* ... */ }
if (isOrgAdmin(member.role)) { /* ... */ }

// Check minimum role level
if (hasMinRole(member.role, OrgRole.ADMIN)) { /* ... */ }
```

### Navigation Config

`shared/constants/navigation.tsx` exports the `navItems` array used by the Sidebar. Each item declares:

```tsx
{
  label: 'Products',
  path: '/products',
  icon: <ProductsIcon />,
  roles: [],              // empty = all roles can see it
  disabled: false,
}
```

Set `roles` to restrict visibility (e.g., `[OrgRole.OWNER, OrgRole.ADMIN]`). Set `disabled: true` for "Coming Soon" features.

---

## How to Add a New Feature

Here's a step-by-step walkthrough for adding a new feature module — using "Reports" as an example.

### 1. Create the Folder Structure

```
src/features/reports/
├── api/
│   └── reportApi.ts
├── components/
│   ├── ReportTable.tsx
│   ├── ReportTable.css
│   └── index.ts
├── pages/
│   ├── ReportsPage.tsx
│   └── ReportsPage.css
└── __tests__/
    └── ReportsPage.test.tsx
```

### 2. Define Types

Add a new type file in `shared/types/`:

```tsx
// src/shared/types/report.ts
export interface Report {
  id: string;
  title: string;
  generatedAt: string;
  status: 'pending' | 'complete' | 'failed';
}
```

Export it from the barrel:

```tsx
// src/shared/types/index.ts
export * from './report';
```

### 3. Create the API File

```tsx
// src/features/reports/api/reportApi.ts
import { apiClient } from '@/shared/api/client';
import type { Report } from '@/shared/types';

export const reportApi = {
  list: () => apiClient.get<Report[]>('/reports').then(r => r.data),
  get: (id: string) => apiClient.get<Report>(`/reports/${id}`).then(r => r.data),
  generate: () => apiClient.post<Report>('/reports').then(r => r.data),
  delete: (id: string) => apiClient.delete(`/reports/${id}`),
};
```

### 4. Build the Page

```tsx
// src/features/reports/pages/ReportsPage.tsx
import { useApiData } from '@/shared/hooks';
import { reportApi } from '../api/reportApi';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { LoadingState } from '@/shared/components/ui/LoadingState';
import { ErrorBanner } from '@/shared/components/ui/ErrorBanner';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import type { Report } from '@/shared/types';
import './ReportsPage.css';

export function ReportsPage() {
  const { data: reports, loading, error } = useApiData<Report[]>(
    () => reportApi.list(),
    []
  );

  return (
    <>
      <PageHeader title="Reports" subtitle="Generated inventory reports" />
      {loading && <LoadingState />}
      {error && <ErrorBanner message={error} />}
      {reports && !reports.length && <EmptyState message="No reports generated yet." />}
      {reports && reports.length > 0 && (
        <div className="reports-page__content">
          {/* Your report table/list here */}
        </div>
      )}
    </>
  );
}
```

### 5. Add the Route

In `src/app/App.tsx`, add the route inside the protected layout group:

```tsx
<Route path="reports" element={<ReportsPage />} />
```

If the feature requires a specific role, wrap it in `RoleRoute`:

```tsx
<Route element={<RoleRoute allowedRoles={[OrgRole.OWNER, OrgRole.ADMIN]} />}>
  <Route path="reports" element={<ReportsPage />} />
</Route>
```

### 6. Add to Sidebar Navigation

In `src/shared/constants/navigation.tsx`, add a new entry to the `navItems` array:

```tsx
{
  label: 'Reports',
  path: '/reports',
  icon: <ReportsIcon />,
  roles: [],               // or specific roles
  disabled: false,
}
```

Create the icon in `nav-icons.tsx` or import from your icon set.

### 7. Write Tests

```tsx
// src/features/reports/__tests__/ReportsPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReportsPage } from '../pages/ReportsPage';

vi.mock('../api/reportApi', () => ({
  reportApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

describe('ReportsPage', () => {
  it('renders the page header', async () => {
    render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });
});
```

---

## Testing

### Running Tests

```bash
npm run test              # Run all tests once
npm run test:watch        # Watch mode — re-runs on file changes
npm run test:coverage     # Generate a coverage report
```

### Test Configuration

Tests are configured in `vite.config.ts` under the `test` key:

| Setting | Value | Notes |
| ------- | ----- | ----- |
| `environment` | `jsdom` | Simulates a browser DOM |
| `globals` | `true` | `describe`, `it`, `expect`, `vi` available without imports |
| `setupFiles` | `src/test/setup.ts` | Imports `@testing-library/jest-dom/vitest` for extra matchers |
| `include` | `src/**/*.{test,spec}.{ts,tsx}` | Default Vitest glob pattern |

The test TypeScript config (`tsconfig.test.json`) relaxes `noUnusedLocals` and `noUnusedParameters` to avoid conflicts with mock-heavy test code.

### Writing Tests

**Component tests** use Testing Library:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('shows the form after clicking add', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  await user.click(screen.getByRole('button', { name: /add/i }));

  await waitFor(() => {
    expect(screen.getByRole('form')).toBeInTheDocument();
  });
});
```

**Hook tests** use `renderHook`:

```tsx
import { renderHook, waitFor } from '@testing-library/react';

it('fetches data on mount', async () => {
  const { result } = renderHook(() => useApiData(() => Promise.resolve(['a', 'b']), []));

  await waitFor(() => {
    expect(result.current.data).toEqual(['a', 'b']);
  });
});
```

### Mocking API Calls

Use `vi.mock` to mock API modules:

```tsx
vi.mock('@/features/products/api/productApi', () => ({
  productApi: {
    list: vi.fn().mockResolvedValue([
      { id: '1', name: 'Widget', sku: 'W-001' },
    ]),
  },
}));
```

For the Axios client itself, mock `shared/api/client`:

```tsx
vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
```

### Test File Locations

Tests live in `__tests__/` folders alongside the code they test:

```
src/
├── app/__tests__/App.test.tsx
├── features/
│   └── auth/
│       ├── components/__tests__/ProtectedRoute.test.tsx
│       └── context/__tests__/auth-reducer.test.ts
├── shared/
│   ├── components/ui/__tests__/ErrorBoundary.test.tsx
│   └── hooks/__tests__/
│       ├── useApiData.test.ts
│       ├── useAsyncAction.test.ts
│       └── usePagination.test.ts
```

---

## PR Review Checklist

Before opening (or approving) a pull request, verify:

- [ ] **TypeScript** — No `any` types. No `@ts-ignore` comments. All new types live in `shared/types/`.
- [ ] **Lint** — `npm run lint` passes with zero errors.
- [ ] **Tests** — `npm run test` passes. New features have corresponding tests.
- [ ] **CSS** — Co-located `.css` file (or shared stylesheet for common patterns). Uses CSS variables for colors/spacing. BEM class naming.
- [ ] **Hooks** — Data fetching uses `useApiData` or `useAsyncAction`. No raw `useEffect` + `fetch` patterns. Complex state extracted into custom hooks.
- [ ] **Error handling** — Uses `extractApiError`. Displays `<ErrorBanner>` for errors, `<LoadingState>` for loading.
- [ ] **Routing** — New routes added to `App.tsx`. Protected routes wrapped in `ProtectedRoute` / `RoleRoute` as needed.
- [ ] **Navigation** — New sidebar items added to `navigation.tsx` with appropriate role restrictions.
- [ ] **No hardcoded strings** — API URLs come from env vars. No magic numbers.
- [ ] **No console.log** — Remove debug logging before merge.
- [ ] **Build** — `npm run build` completes without errors.
