# Quick Task 260325-4yy — Dockerize Application

**Status:** Complete
**Date:** 2026-03-25

## What Was Created/Modified

### Created (previous commits)
- **`.dockerignore`** — Excludes `node_modules`, `.next`, `.git`, `.planning`, `.env*`, build artifacts from Docker context
- **`Dockerfile`** — Multi-stage build with 5 stages:
  - `base`: Node 24 Alpine + pnpm 9 via corepack
  - `deps`: Cached dependency layer (`pnpm install --frozen-lockfile`)
  - `dev`: Hot-reload target for development
  - `builder`: Runs `pnpm build` with placeholder env vars to produce standalone output
  - `runner`: Minimal production image (Node 24 Alpine + standalone server, non-root `nextjs` user)
- **`docker-compose.yml`** — Dev and prod services with profile-based selection, env_file injection, health check on prod
- **`next.config.ts`** — Added `output: "standalone"` for minimal production builds

### Modified (this session)
- **`pnpm-workspace.yaml`** — Added `packages: ["."]` field. pnpm 9 enters workspace mode when this file exists and errors without an explicit `packages` field. Required for Docker builds to succeed.

## How to Use

### Development (hot-reload)
```bash
docker compose --profile dev up
```
- Accessible at http://localhost:3000
- Source code is volume-mounted — changes reflect immediately without rebuild
- `node_modules` and `.next` use anonymous volumes to avoid host conflicts

### Production (standalone)
```bash
docker compose --profile prod up
```
- Accessible at http://localhost:3000
- Optimized standalone server (~198MB image vs ~849MB dev)
- Runs as non-root `nextjs` user (UID 1001)
- Health check via `wget` every 30s

### Rebuild after dependency changes
```bash
docker compose --profile dev build
docker compose --profile prod build
```

### Tear down
```bash
docker compose --profile dev down
docker compose --profile prod down
```

## Smoke Test Results

| Target | Image Size | HTTP Response | Status |
|--------|-----------|---------------|--------|
| dev    | 849MB     | 200           | Pass   |
| prod   | 198MB     | 307 (redirect to login) | Pass   |

## Caveats

1. **No database in Docker** — The app connects to external Neon Postgres via `DATABASE_URL` in `.env.local`. No local database container is included.
2. **Build-time placeholders** — The builder stage uses dummy env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`) so `next build` can compile without real secrets. Real values are injected at runtime via `env_file`.
3. **Docker Compose V2 required** — Uses `docker compose` (V2 plugin), not the legacy `docker-compose` binary. Install via `mkdir -p ~/.docker/cli-plugins && curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o ~/.docker/cli-plugins/docker-compose && chmod +x ~/.docker/cli-plugins/docker-compose` if not available.
4. **`output: "standalone"`** — This is always active in `next.config.ts`. It doesn't affect `pnpm dev` (local or Docker), but it does change the `pnpm build` output structure. This is intentional and compatible with both Docker and Vercel deployments.
5. **`public/` directory** — The Dockerfile copies `public/` from the builder stage. If this directory is ever removed, the `COPY --from=builder /app/public ./public` line must be removed from the runner stage.

## Commits

| Hash | Message |
|------|---------|
| `7831662` | `chore(260325-4yy-01): dockerize application with multi-stage build` |
| `498ee76` | `chore(docker): update Docker configuration and improve health checks` |
| `87c39d4` | `chore(pnpm): add workspace configuration for package management` |
