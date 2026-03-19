# Architecture

> A deep dive into the technical architecture of EasyInventory Web — routing, authentication, multi-tenancy, RBAC, and state management.

[Back to README](../README.md)

---

## Table of Contents

1. [Application Shell](#application-shell)
2. [Routing Architecture](#routing-architecture)
   - [Route Tree](#route-tree)
   - [Route Guards](#route-guards)
3. [Authentication System](#authentication-system)
   - [Cognito Integration](#cognito-integration)
   - [Auth Context & Reducer](#auth-context--reducer)
   - [Login Flow](#login-flow)
   - [Invited User Flow](#invited-user-flow)
   - [Password Reset Flow](#password-reset-flow)
   - [Session Persistence](#session-persistence)
4. [Multi-Tenancy (Org Context)](#multi-tenancy-org-context)
5. [API Client & Interceptors](#api-client--interceptors)
6. [Role-Based Access Control](#role-based-access-control)
   - [System Roles](#system-roles)
   - [Organization Roles](#organization-roles)
   - [Enforcement Layers](#enforcement-layers)
7. [State Management Philosophy](#state-management-philosophy)
8. [Layout System](#layout-system)

---

## Application Shell

The app boots in three steps:

1. **`index.html`** — Loads the HTML skeleton. Includes a `<script>var global = globalThis;</script>` polyfill (required by the Cognito SDK).
2. **`src/app/main.tsx`** — React entry point. Renders `<App />` into the `#root` div.
3. **`src/app/App.tsx`** — Wraps the entire app in `<BrowserRouter>` and `<AuthProvider>`, then defines all routes.

```
index.html
  └─ main.tsx
       └─ <AuthProvider>          ← Auth context wraps everything
            └─ <BrowserRouter>
                 └─ <Routes>      ← Route definitions from App.tsx
```

---

## Routing Architecture

### Route Tree

```
/
├── /login                        (public — LoginPage)
├── /forgot-password              (public — ForgotPasswordPage)
├── /reset-password               (public — ResetPasswordPage)
│
└── /* (protected)                 ← ProtectedRoute guard
     └── /* (org-required)         ← RequireOrg guard
          └── <AppLayout>          ← Sidebar + content shell
               ├── /              (DashboardPage — index route)
               ├── /products      (ProductListPage)
               ├── /products/new  (ProductFormPage)
               ├── /products/:id  (ProductDetailPage)
               ├── /products/:id/edit (ProductFormPage)
               ├── /suppliers     (SuppliersPage)
               ├── /inventory     (InventoryPage — placeholder)
               ├── /store-layout  (StoreLayoutPage — placeholder)
               ├── /analytics     (AnalyticsPage — placeholder)
               │
               ├── /org-settings  ← RoleRoute [OWNER, ADMIN]
               │    └── (OrgSettingsPage)
               │
               ├── /admin         ← RoleRoute [SYSTEM_ADMIN]
               │    └── (AdminPage)
               │
               └── /*             (NotFoundPage — 404 catch-all)
```

### Route Guards

Three components protect routes at different levels:

#### ProtectedRoute

- Checks if the user is authenticated (has a valid Cognito session).
- If **not authenticated** → redirects to `/login`.
- If **authenticated** → renders child routes via `<Outlet />`.
- Shows a `LoadingState` while the initial auth check is in progress.

#### RequireOrg

- Checks if the user belongs to at least one organization.
- If **no org memberships** → shows a "No Organization" message with explanation.
- If **has memberships** → wraps children in `<OrgProvider>` to make org context available.

#### RoleRoute

- Accepts an `allowedRoles` prop (array of `SystemRole` and/or `OrgRole` values).
- Checks the current user's system role and their role in the selected org.
- If **role matches** → renders `<Outlet />`.
- If **role doesn't match** → redirects to `/` (Dashboard).

**Nesting order matters:**

```
ProtectedRoute → RequireOrg → OrgProvider → AppLayout → RoleRoute → Page
```

Each guard runs only if the previous one passes, ensuring a clean cascade of access checks.

---

## Authentication System

### Cognito Integration

All direct Cognito SDK calls are isolated in `src/features/auth/api/cognito-service.ts`. This file exports a thin wrapper around `amazon-cognito-identity-js`:

| Function | What It Does |
| -------- | ------------ |
| `signIn(email, password)` | Authenticates via SRP. Returns `{ token, user }` on success, or `{ challenge: 'NEW_PASSWORD_REQUIRED', cognitoUser }` if the user must set a new password. |
| `completeNewPassword(cognitoUser, newPassword)` | Completes the new-password challenge. Returns `{ token, user }`. |
| `forgotPassword(email)` | Sends a verification code to the user's email. |
| `confirmForgotPassword(email, code, newPassword)` | Resets the password using the verification code. |
| `getCurrentSession()` | Returns the current valid session token, or `null` if expired. Used for session persistence on page reload. |
| `signOut()` | Clears the Cognito session from the client. |

Cognito credentials are configured from environment variables:

```
VITE_COGNITO_REGION       → CognitoUserPool region
VITE_COGNITO_USER_POOL_ID → CognitoUserPool UserPoolId
VITE_COGNITO_APP_CLIENT_ID → CognitoUserPool ClientId
```

### Auth Context & Reducer

Authentication state is managed by `AuthContext` using `useReducer`. This centralizes all auth state transitions in a single, predictable reducer.

#### State Shape

```typescript
interface AuthState {
  user: AuthUser | null;      // Currently logged-in user
  token: string | null;        // JWT access token
  loading: boolean;            // True during async operations
  error: string | null;        // Last error message
  needsNewPassword: boolean;   // True when Cognito returns NEW_PASSWORD_REQUIRED
  cognitoUser: any | null;     // Temporary Cognito user object for password challenge
}
```

#### Reducer Actions

| Action | Dispatched When |
| ------ | --------------- |
| `LOGIN_START` | User submits login form |
| `LOGIN_SUCCESS` | Cognito returns a valid session |
| `LOGIN_FAILURE` | Cognito returns an error |
| `NEW_PASSWORD_REQUIRED` | Cognito returns the new-password challenge |
| `NEW_PASSWORD_START` | User submits new password form |
| `NEW_PASSWORD_SUCCESS` | New password accepted, session created |
| `NEW_PASSWORD_FAILURE` | New password submission failed |
| `LOGOUT` | User clicks Sign Out |
| `RESTORE_SESSION` | App mounts and finds an existing valid session |
| `RESTORE_SESSION_FAILED` | App mounts but no valid session exists |
| `SET_LOADING` | Toggle loading state for async checks |
| `CLEAR_ERROR` | Dismiss error messages |

#### What AuthContext Provides

```typescript
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  needsNewPassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

Consumers access it via:

```tsx
const { user, token, login, logout } = useAuth();
```

### Login Flow

```
User enters email + password
  → dispatch(LOGIN_START)
  → cognitoService.signIn(email, password)
     ├─ Success → dispatch(LOGIN_SUCCESS { user, token })
     │            → redirect to Dashboard
     ├─ NEW_PASSWORD_REQUIRED → dispatch(NEW_PASSWORD_REQUIRED { cognitoUser })
     │                          → show "Set New Password" form
     └─ Error → dispatch(LOGIN_FAILURE { error })
                → show error banner
```

### Invited User Flow

```
Admin invites user → Cognito sends email with temporary password
  → User enters email + temp password on login page
  → Cognito returns NEW_PASSWORD_REQUIRED challenge
  → App shows "Set New Password" view
  → User enters new password
  → dispatch(NEW_PASSWORD_START)
  → cognitoService.completeNewPassword(cognitoUser, newPassword)
     ├─ Success → dispatch(NEW_PASSWORD_SUCCESS { user, token })
     │            → redirect to Dashboard
     └─ Error → dispatch(NEW_PASSWORD_FAILURE { error })
```

### Password Reset Flow

```
User clicks "Forgot password?"
  → navigates to /forgot-password
  → enters email → cognitoService.forgotPassword(email)
  → navigates to /reset-password (with email in URL state)
  → enters code + new password → cognitoService.confirmForgotPassword(...)
     ├─ Success → redirect to /login with success message
     └─ Error → show error banner
```

### Session Persistence

On every app mount (page load / refresh):

```
AuthProvider mounts
  → dispatch(SET_LOADING)
  → cognitoService.getCurrentSession()
     ├─ Valid session → dispatch(RESTORE_SESSION { user, token })
     │                  → user stays logged in
     └─ No session → dispatch(RESTORE_SESSION_FAILED)
                      → redirect to /login
```

The Cognito SDK stores session tokens in the browser's Local Storage. The `getCurrentSession()` function checks if a valid (non-expired) token exists and refreshes it if needed.

---

## Multi-Tenancy (Org Context)

Users can belong to multiple organizations. The `OrgContext` manages which organization is currently selected.

### How It Works

1. **`OrgProvider`** wraps all content inside `RequireOrg`.
2. On mount, it receives the user's `memberships` array (a list of orgs the user belongs to).
3. It sets `selectedOrgId` to the first membership by default (or restores a previously selected one).
4. All API requests include the selected org ID in the `X-Org-Id` header (added by the Axios interceptor).
5. When the user switches orgs via the **OrgSwitcher** dropdown, `selectedOrgId` updates and all data-fetching hooks re-run.

### Context Value

```typescript
interface OrgContextValue {
  selectedOrgId: string | null;
  selectedOrg: OrgMembership | null;
  memberships: OrgMembership[];
  switchOrg: (orgId: string) => void;
  userRole: OrgRole | null;          // The user's role in the selected org
}
```

### Data Isolation

Because `X-Org-Id` is sent with every request, the backend scopes all data to the selected organization. Switching orgs effectively changes the "tenant" — products, suppliers, and members all reflect the new org.

---

## API Client & Interceptors

A single Axios instance lives in `src/shared/api/client.ts`:

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

### Request Interceptor

Before every outgoing request:

1. **Auth token** — Reads the JWT from auth state and sets `Authorization: Bearer <token>`.
2. **Org ID** — Reads the selected org from org context and sets `X-Org-Id: <orgId>`.

### Response Interceptor

On error responses:

- **401 Unauthorized** — Clears the stored auth token, effectively logging the user out. The next navigation will trigger a redirect to `/login`.

### Why a Single Instance?

All feature API files import this one `apiClient`. This ensures consistent headers, base URL, and error handling across the entire app. Never create additional Axios instances.

---

## Role-Based Access Control

### System Roles

| Role | Value | Description |
| ---- | ----- | ----------- |
| `SYSTEM_ADMIN` | `'SYSTEM_ADMIN'` | Platform-level admin. Can manage all orgs and users. |

System role is set on the user record itself, independent of any organization.

### Organization Roles

| Role | Value | Hierarchy |
| ---- | ----- | --------- |
| `OWNER` | `'OWNER'` | Highest — full org control |
| `ADMIN` | `'ADMIN'` | Can manage members (below admin level) |
| `EMPLOYEE` | `'EMPLOYEE'` | Standard data access |
| `VIEWER` | `'VIEWER'` | Read-only access |

### Helper Functions

```tsx
import { isOrgOwner, isOrgAdmin, isOrgAdminOrAbove, hasMinRole } from '@/shared/constants/roles';

isOrgOwner(role)          // true if role === 'OWNER'
isOrgAdmin(role)          // true if role === 'ADMIN'
isOrgAdminOrAbove(role)   // true if role === 'OWNER' or 'ADMIN'
hasMinRole(role, min)     // true if role >= min in the hierarchy
```

### Enforcement Layers

RBAC is enforced at **four levels**:

| Layer | Mechanism | Example |
| ----- | --------- | ------- |
| **Route** | `RoleRoute` component | `/admin` is only accessible to `SYSTEM_ADMIN` |
| **Sidebar** | `navItems[].roles` filtering | Org Settings link is hidden from Employee/Viewer |
| **Component** | Conditional rendering | Delete button only shows for Owner/Admin |
| **API** | Backend validation | Even if UI is bypassed, the backend rejects unauthorized requests |

The frontend enforcement is for UX (hiding things users can't do). The **backend is the source of truth** — it validates every request.

---

## State Management Philosophy

The app uses **no external state management library**. All state is managed through:

### 1. React Context (Global Shared State)

| Context | Provider | Hook | Scope |
| ------- | -------- | ---- | ----- |
| `AuthContext` | `AuthProvider` (wraps entire app) | `useAuth()` | User identity, token, login/logout |
| `OrgContext` | `OrgProvider` (wraps protected content) | `useOrg()` | Selected org, memberships, org role |

### 2. Component-Local State

Feature pages use `useState` for local UI state (form inputs, modals open/closed, search filters).

### 3. Custom Hooks (Data-Fetching Patterns)

| Hook | Pattern | State |
| ---- | ------- | ----- |
| `useApiData` | Fetch on mount + dependency changes | `{ data, loading, error, refetch }` |
| `useAsyncAction` | Execute on user action | `{ execute, loading, error, success }` |
| `usePagination` | Paginate an array | `{ paginatedItems, currentPage, ... }` |

### Why Not Redux / Zustand?

- The app's shared state is limited to **auth** and **org selection** — two contexts handle this cleanly.
- Feature data is fetched per-page and doesn't need to persist across routes.
- Custom hooks encapsulate all data-fetching complexity.
- Adding a state library would increase bundle size and conceptual overhead with no benefit.

---

## Layout System

### AppLayout

The main layout wraps all authenticated pages:

```
┌─────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────┐  │
│  │           │  │                 │  │
│  │  Sidebar  │  │  <Outlet />    │  │
│  │           │  │  (page content) │  │
│  │           │  │                 │  │
│  │           │  │                 │  │
│  └──────────┘  └─────────────────┘  │
└─────────────────────────────────────┘
```

- **Sidebar** — Renders navigation links (filtered by role), user info, org switcher, and collapse control.
- **Content area** — Renders the matched child route via React Router's `<Outlet />`.

### AuthLayout

Used for public pages (login, forgot password, reset password):

```
┌─────────────────────────────────────┐
│  ┌────────────┐  ┌───────────────┐  │
│  │             │  │               │  │
│  │   Brand     │  │   Auth Form   │  │
│  │   Panel     │  │   (Outlet)    │  │
│  │             │  │               │  │
│  └────────────┘  └───────────────┘  │
└─────────────────────────────────────┘
```

A two-panel layout: branding on the left, authentication form on the right. On mobile, the brand panel is hidden.

### PageHeader

A reusable header component used at the top of every page:

```tsx
<PageHeader
  title="Products"                         // Required
  subtitle="Manage your product catalog"   // Optional
  backTo={{ label: 'Back', path: '/products' }}  // Optional back link
  actions={<button>Add Product</button>}   // Optional right-aligned actions
/>
```

This ensures visual consistency across all pages.
