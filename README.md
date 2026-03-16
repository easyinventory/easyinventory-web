# EasyInventory Web

React frontend for the EasyInventory inventory management platform.

## Prerequisites

- Node.js 20+
- npm

## Quick Start

1. Clone the repo
2. `cp .env.example .env` and fill in values
3. `npm install`
4. `npm run dev`
5. App: http://localhost:5173

## Development Commands

| Command            | What it does               |
|--------------------|----------------------------|
| `npm run dev`      | Start dev server           |
| `npm run build`    | Production build           |
| `npm run preview`  | Preview production build   |
| `npm run lint`     | Run ESLint                 |
| `npm run lint:fix` | Auto-fix ESLint issues     |

## Project Structure
```
src/
├── api/             # Axios client + API functions
├── auth/            # Auth context + Cognito integration (PR-09)
├── components/
│   ├── layout/      # Sidebar, AppLayout, PageHeader
│   └── ui/          # Shared UI components
├── hooks/           # Custom React hooks
├── pages/           # Route-level page components
├── App.tsx          # Router + route definitions
├── main.tsx         # Entry point
└── index.css        # Global styles + CSS variables
```

## CSS Approach

This project uses **plain CSS** with CSS variables for theming.
Each component has a co-located `.css` file (e.g., `Sidebar.tsx`
and `Sidebar.css`). Global variables and utility classes are in
`src/index.css`.

No Tailwind, no CSS-in-JS, no preprocessors. Keep it simple.

## Environment Variables

| Variable                     | Description                    |
|------------------------------|--------------------------------|
| `VITE_API_URL`               | Backend API base URL           |
| `VITE_COGNITO_REGION`        | AWS Cognito region (PR-09)     |
| `VITE_COGNITO_USER_POOL_ID`  | Cognito User Pool ID (PR-09)   |
| `VITE_COGNITO_APP_CLIENT_ID` | Cognito App Client ID (PR-09)  |

## Authentication

This app uses AWS Cognito for authentication. After logging in,
the JWT (IdToken) is automatically attached to all API requests
via an Axios interceptor.

### Login flow
1. User enters email + password on `/login`
2. Cognito SDK handles SRP authentication
3. On success, IdToken stored in React state + synced to Axios
4. User is redirected to `/`

### Logout flow
1. User clicks "Sign out" in the sidebar
2. Cognito session is cleared
3. React state is cleared, Axios token removed
4. User is redirected to `/login`

### Session persistence
The Cognito SDK stores the refresh token in localStorage.
On page refresh, the AuthContext checks for an existing session
and restores it automatically (no re-login needed).

### Password reset flow
1. User clicks "Forgot password?" on `/login`
2. Enters email on `/forgot-password`
3. Cognito sends a 6-digit verification code to their email
4. User enters code + new password on `/reset-password`
5. On success, redirected to `/login` to sign in with new password

Password requirements (Cognito defaults):
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character