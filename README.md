# EasyInventory Web

> React + TypeScript frontend for the EasyInventory inventory-management platform.

EasyInventory helps retail teams manage products, suppliers, store floor plans, and team members across multiple organizations — all from a modern, role-aware dashboard.

## Quick Start

```bash
git clone https://github.com/<your-org>/easyinventory-web.git
cd easyinventory-web
cp .env.example .env          # fill in Cognito + API values
npm install
npm run dev                   # http://localhost:5173
```

## Documentation

| Guide | Description |
| ----- | ----------- |
| [Project Overview](docs/overview.md) | Tech stack, project structure, feature inventory, and design decisions |
| [User Guide](docs/user-guide.md) | End-user walkthrough — login, dashboard, products, suppliers, org settings, admin |
| [Getting Started](docs/getting-started.md) | Developer setup — clone, install, env vars, dev server, npm scripts, Docker dev |
| [Developer Guide](docs/developer-guide.md) | Coding standards, adding features, testing, conventions, PR checklist |
| [Architecture](docs/architecture.md) | Routing, authentication, multi-tenancy, API client, RBAC, state management |
| [Deployment Guide](docs/deployment-guide.md) | Docker production builds, Nginx, environment variables, troubleshooting |
| [API Reference](docs/api-reference.md) | Every backend endpoint, request/response types, headers |

## Key Commands

| Command               | What It Does                              |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Start dev server with HMR                 |
| `npm run build`       | TypeScript check + production build       |
| `npm run test`        | Run full test suite                       |
| `npm run test:watch`  | Tests in watch mode                       |
| `npm run lint`        | Run ESLint                                |

## Tech Stack

React 19 · TypeScript 5.9 · Vite 8 · React Router 7 · Axios · AWS Cognito · Vitest · Plain CSS

## License

Private — see your team for access details.
