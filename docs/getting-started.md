# Getting Started

> Everything you need to clone, configure, and run EasyInventory Web on your local machine.

[Back to README](../README.md)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Install Dependencies](#install-dependencies)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Start the Dev Server](#start-the-dev-server)
6. [Verify It Works](#verify-it-works)
7. [Available Scripts](#available-scripts)
8. [Running with Docker (Dev)](#running-with-docker-dev)

---

## Prerequisites

| Tool | Minimum Version | Install |
| ---- | --------------- | ------- |
| **Node.js** | 18+ (LTS recommended) | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ (ships with Node) | Included with Node.js |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/) |
| **Docker** *(optional)* | 20+ | [docker.com](https://www.docker.com/) |

### Verify Your Setup

**macOS / Linux:**

```bash
node --version    # Should print v18.x or higher
npm --version     # Should print 9.x or higher
git --version
```

**Windows (PowerShell):**

```powershell
node --version    # Should print v18.x or higher
npm --version     # Should print 9.x or higher
git --version
```

---

## Clone the Repository

**macOS / Linux:**

```bash
git clone <your-repo-url> easyinventory-web
cd easyinventory-web
```

**Windows (PowerShell):**

```powershell
git clone <your-repo-url> easyinventory-web
cd easyinventory-web
```

> Replace `<your-repo-url>` with the actual Git remote URL for the project.

---

## Install Dependencies

**macOS / Linux / Windows:**

```bash
npm install
```

This reads `package.json` and installs all production and dev dependencies into `node_modules/`. A `package-lock.json` ensures every developer gets identical versions.

---

## Configure Environment Variables

Copy the example file:

**macOS / Linux:**

```bash
cp .env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in the values:

```env
# Backend API URL — point to your local or staging API
VITE_API_URL=http://localhost:8000

# AWS Cognito configuration
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_XXXXXXXXX
VITE_COGNITO_APP_CLIENT_ID=your-app-client-id-here
```

### Where to Get These Values

| Variable | Source |
| -------- | ------ |
| `VITE_API_URL` | The URL where your EasyInventory backend API is running. Default `http://localhost:8000` for local development. |
| `VITE_COGNITO_REGION` | AWS region where your Cognito User Pool is deployed (e.g., `us-east-2`). |
| `VITE_COGNITO_USER_POOL_ID` | Found in the AWS Console → Cognito → User Pools → Your Pool → Pool ID. |
| `VITE_COGNITO_APP_CLIENT_ID` | Found in the AWS Console → Cognito → User Pools → Your Pool → App Integration → App Client ID. |

> **Important:** All `VITE_*` variables are baked into the JavaScript bundle at build time. They are **not** secret — never put API keys or secrets in these variables.

---

## Start the Dev Server

**macOS / Linux / Windows:**

```bash
npm run dev
```

Vite starts a dev server at **http://localhost:5173** with Hot Module Replacement (HMR). Changes to any source file are reflected in the browser instantly without a full page reload.

### What You Should See

```
  VITE v8.x.x  ready in XXXms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

---

## Verify It Works

1. Open **http://localhost:5173** in your browser.
2. You should see the **login page**.
3. If you have valid Cognito credentials, log in to reach the Dashboard.
4. If you see the login form without any console errors, the frontend is running correctly. Backend connectivity issues will show as errors when you attempt to log in or fetch data.

### Common First-Run Issues

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Blank white page | Missing `.env` file or incorrect `VITE_API_URL` | Ensure `.env` exists and has all required values |
| `global is not defined` in console | Cognito SDK expects Node `global` | The project includes a polyfill in `index.html` (`<script>var global = globalThis;</script>`). Make sure this line is present. |
| CORS errors in console | Backend not allowing requests from `localhost:5173` | Configure your backend's CORS settings to allow `http://localhost:5173` |
| `MODULE_NOT_FOUND` on start | Dependencies not installed | Run `npm install` |

---

## Available Scripts

All scripts are defined in `package.json` and run with `npm run <script>`:

| Script | Command | Description |
| ------ | ------- | ----------- |
| `dev` | `npm run dev` | Start the Vite dev server with HMR at `localhost:5173` |
| `build` | `npm run build` | Type-check with `tsc -b` then produce a production bundle in `dist/` |
| `preview` | `npm run preview` | Serve the `dist/` folder locally to preview the production build |
| `lint` | `npm run lint` | Run ESLint across the project and report errors/warnings |
| `lint:fix` | `npm run lint:fix` | Run ESLint and automatically fix what it can |
| `test` | `npm run test` | Run all Vitest tests once and exit |
| `test:watch` | `npm run test:watch` | Run Vitest in watch mode — re-runs on file changes |
| `test:coverage` | `npm run test:coverage` | Run all tests and generate a coverage report |

### Quick Command Reference

```bash
# Daily development
npm run dev              # Start dev server
npm run lint:fix         # Fix lint issues
npm run test:watch       # Tests in watch mode

# Before pushing
npm run lint             # Check for lint errors
npm run test             # Run full test suite
npm run build            # Verify the production build compiles

# Review production output
npm run build && npm run preview
```

---

## Running with Docker (Dev)

The `Dockerfile` at the project root is configured for **development** — it runs the Vite dev server inside a container.

### Build and Run

**macOS / Linux:**

```bash
docker build -t easyinventory-dev .
docker run -p 5173:5173 easyinventory-dev
```

**Windows (PowerShell):**

```powershell
docker build -t easyinventory-dev .
docker run -p 5173:5173 easyinventory-dev
```

Then open **http://localhost:5173** in your browser.

### Environment Variables in Docker

Pass environment variables at build time using `--build-arg`:

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:8000 \
  --build-arg VITE_COGNITO_REGION=us-east-2 \
  --build-arg VITE_COGNITO_USER_POOL_ID=us-east-2_XXXXXXXXX \
  --build-arg VITE_COGNITO_APP_CLIENT_ID=your-client-id \
  -t easyinventory-dev .
```

> **For production Docker builds**, see the [Deployment Guide](deployment-guide.md).
