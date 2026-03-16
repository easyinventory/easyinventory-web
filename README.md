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