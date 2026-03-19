# Deployment Guide

> How to build, containerize, and deploy EasyInventory Web for production, plus environment configuration and troubleshooting.

[Back to README](../README.md)

---

## Table of Contents

1. [Production Build (Local)](#production-build-local)
2. [Docker Production Build](#docker-production-build)
   - [Building the Image](#building-the-image)
   - [Running the Container](#running-the-container)
3. [Nginx Configuration](#nginx-configuration)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Build-Time vs Runtime Variables](#build-time-vs-runtime-variables)
6. [Deployment Checklist](#deployment-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Production Build (Local)

To create a production-optimized bundle without Docker:

```bash
npm run build
```

This runs two steps:
1. **`tsc -b`** — TypeScript type-checking (catches errors before bundling).
2. **`vite build`** — Bundles, tree-shakes, and minifies the app into the `dist/` directory.

### Preview the Build

```bash
npm run preview
```

Vite serves the `dist/` folder locally at **http://localhost:4173** so you can verify the production build before deploying.

### What's in `dist/`

```
dist/
├── index.html              # HTML entry point with hashed asset references
├── assets/
│   ├── index-[hash].js     # Main JS bundle
│   ├── index-[hash].css    # Extracted CSS
│   └── ...                 # Code-split chunks + static assets
```

All filenames include a content hash for cache busting.

---

## Docker Production Build

The production Dockerfile (`Dockerfile.web`) uses a **multi-stage build**:

| Stage | Base Image | Purpose |
| ----- | ---------- | ------- |
| **Build** | `node:lts-alpine` | Install deps, inject env vars, run `npm run build` |
| **Serve** | `nginx:stable-alpine` | Serve the static `dist/` bundle on port 3000 |

### Building the Image

**macOS / Linux:**

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_COGNITO_REGION=us-east-2 \
  --build-arg VITE_COGNITO_USER_POOL_ID=us-east-2_XXXXXXXXX \
  --build-arg VITE_COGNITO_APP_CLIENT_ID=your-client-id \
  -f Dockerfile.web \
  -t easyinventory-web:latest .
```

**Windows (PowerShell):**

```powershell
docker build `
  --build-arg VITE_API_URL=https://api.example.com `
  --build-arg VITE_COGNITO_REGION=us-east-2 `
  --build-arg VITE_COGNITO_USER_POOL_ID=us-east-2_XXXXXXXXX `
  --build-arg VITE_COGNITO_APP_CLIENT_ID=your-client-id `
  -f Dockerfile.web `
  -t easyinventory-web:latest .
```

> **Critical:** `VITE_*` variables must be passed as `--build-arg` because they are embedded into the JavaScript bundle at compile time. They **cannot** be changed after the image is built.

### Running the Container

```bash
docker run -p 3000:3000 easyinventory-web:latest
```

Open **http://localhost:3000** in your browser.

### Multi-Stage Build Breakdown

```dockerfile
# Stage 1: Build
FROM node:lts-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                          # Clean install from lockfile
COPY . .
ARG VITE_API_URL                    # Inject env vars as build args
ARG VITE_COGNITO_REGION
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_APP_CLIENT_ID
RUN npm run build                   # Produces dist/

# Stage 2: Serve
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

The final image contains **only Nginx and the static files** — no Node.js, no `node_modules`, minimal attack surface.

---

## Nginx Configuration

The `nginx.conf` file configures how the production container serves the app:

### SPA Routing

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This is essential for single-page applications. When a user navigates to `/products/123`, Nginx tries:
1. Does a file named `/products/123` exist? → **No**
2. Does a directory named `/products/123/` exist? → **No**
3. Fall back to `/index.html` → **Yes** → React Router handles the route

Without this, refreshing on any route other than `/` would return a 404.

### Asset Caching

```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

Files in `/assets/` have content hashes in their filenames, so they can be cached aggressively. Browsers will use the cached version until the hash changes (which happens on every new build).

### Port

The container listens on **port 3000** (configured with `listen 3000;` in `nginx.conf`).

---

## Environment Variables Reference

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `VITE_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |
| `VITE_COGNITO_REGION` | Yes | `us-east-2` | AWS region of the Cognito User Pool |
| `VITE_COGNITO_USER_POOL_ID` | Yes | — | Cognito User Pool ID |
| `VITE_COGNITO_APP_CLIENT_ID` | Yes | — | Cognito App Client ID |

### How They're Used

| Variable | Used In | Purpose |
| -------- | ------- | ------- |
| `VITE_API_URL` | `shared/api/client.ts` | Axios `baseURL` |
| `VITE_COGNITO_REGION` | `auth/api/cognito-service.ts` | Cognito User Pool config |
| `VITE_COGNITO_USER_POOL_ID` | `auth/api/cognito-service.ts` | Cognito User Pool config |
| `VITE_COGNITO_APP_CLIENT_ID` | `auth/api/cognito-service.ts` | Cognito User Pool config |

---

## Build-Time vs Runtime Variables

This is a critical concept for Vite-based applications:

### Build-Time (Compile-Time)

All `VITE_*` environment variables are **replaced with their literal values** during `vite build`. The resulting JavaScript bundle contains the actual strings — there is no runtime lookup.

**Implications:**
- You **must** set `VITE_*` variables before building (via `.env` file or `--build-arg`).
- Changing a variable requires **rebuilding** the app.
- Variables are visible in the browser's JavaScript source — **never put secrets here**.

### What This Means for Docker

```
┌─────────────────────────────┐
│  docker build --build-arg   │  ← Variables baked in here
│  VITE_API_URL=https://...   │
│                             │
│  npm run build → dist/      │  ← JS bundle contains "https://..."
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  docker run                 │  ← No ENV needed at runtime
│  nginx serves dist/         │     (values already in the JS)
└─────────────────────────────┘
```

If you need **different builds for different environments** (staging vs production), you must build separate Docker images with different `--build-arg` values.

---

## Deployment Checklist

Before deploying to any environment:

- [ ] **Environment variables** — All `VITE_*` vars set correctly for the target environment.
- [ ] **API URL** — `VITE_API_URL` points to the correct backend (not `localhost`).
- [ ] **Cognito** — User Pool ID and App Client ID match the target AWS environment.
- [ ] **Build succeeds** — `npm run build` (or Docker build) completes without errors.
- [ ] **Tests pass** — `npm run test` passes in CI.
- [ ] **CORS** — Backend allows requests from the deployed frontend domain.
- [ ] **HTTPS** — Production should be served over HTTPS (configure at load balancer / CDN level).
- [ ] **Docker image tagged** — Use semantic versioning or commit SHA for image tags (not just `latest`).

---

## Troubleshooting

### `global is not defined`

**Symptom:** Console error at app startup, blank white page.

**Cause:** The `amazon-cognito-identity-js` SDK references the Node.js `global` object, which doesn't exist in browsers.

**Fix:** Ensure `index.html` contains the polyfill script **before** the main app script:

```html
<script>var global = globalThis;</script>
```

This line is already present in the project's `index.html`.

---

### TypeScript Errors on Build

**Symptom:** `npm run build` fails with type errors.

**Cause:** The build script runs `tsc -b` (TypeScript project build) before Vite's bundling step. Any type error will abort the build.

**Fix:** Run `npm run lint` and fix all type errors. The strict config (`noUnusedLocals`, `noUnusedParameters`) catches things that are warnings in many projects.

---

### CORS Errors

**Symptom:** Network requests fail with `Access-Control-Allow-Origin` errors in the browser console.

**Cause:** The backend API doesn't include the frontend's origin in its CORS allowlist.

**Fix:** Configure the backend to allow the frontend's domain:
- **Local dev:** Allow `http://localhost:5173`
- **Production:** Allow your deployed frontend domain (e.g., `https://app.example.com`)

---

### Docker Build Fails — Missing Build Args

**Symptom:** Docker build succeeds but the app shows a blank page or fails to connect to the API.

**Cause:** `VITE_*` variables were not passed as `--build-arg` during `docker build`. Without them, the values are empty strings baked into the bundle.

**Fix:** Always pass all four `VITE_*` variables as `--build-arg` when building the production image. See [Building the Image](#building-the-image).

---

### SPA Routes Return 404 in Production

**Symptom:** The app works on `/` but refreshing on `/products` or `/admin` returns a 404.

**Cause:** The web server is looking for a file at `/products` instead of serving `index.html`.

**Fix:** Ensure the Nginx config includes the `try_files` directive:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This is already configured in the project's `nginx.conf`.

---

### Session Lost on Page Refresh

**Symptom:** User is logged out every time they refresh the page.

**Cause:** The Cognito SDK stores tokens in `localStorage`. If `localStorage` is blocked (private browsing, browser settings) or if the Cognito configuration changes, the session can't be restored.

**Fix:**
1. Verify `VITE_COGNITO_USER_POOL_ID` and `VITE_COGNITO_APP_CLIENT_ID` haven't changed between builds.
2. Check that the browser allows `localStorage` for the app's domain.
3. Open DevTools → Application → Local Storage → look for keys prefixed with `CognitoIdentityServiceProvider`.

---

### Slow Docker Build

**Symptom:** Docker builds take a long time, even for small code changes.

**Cause:** Docker layer caching is being invalidated. If `COPY . .` runs before `npm ci`, every code change re-installs all dependencies.

**Fix:** The project's Dockerfiles already use the optimal layer order:

```dockerfile
COPY package*.json ./     # Layer 1 — changes rarely
RUN npm ci                # Layer 2 — cached unless package.json changed
COPY . .                  # Layer 3 — only source code changes
RUN npm run build         # Layer 4 — rebuilds on source changes
```

Ensure you haven't modified this order.
