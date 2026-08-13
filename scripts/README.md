# Snip Build Scripts

## build-bundle.mjs

Assembles a complete release bundle from the three source layers.

### What It Does

1. **Updates submodules** – Fetches latest commits from backend, frontend, cli branches
2. **Builds frontend** – Runs `npm install && npx ng build` in the frontend submodule
3. **Assembles bundle/** – Combines:
   - `backend/server.js` – Bun API server
   - `cli/cli.js` – Node CLI tool
   - `frontend/dist/snip-frontend/browser/*` – Compiled Angular app
4. **Creates config** – Writes to bundle/:
   - `.env` – `PUBLIC_DIR=./public` (tells Bun to serve the compiled UI)
   - `package.json` – `"start": "bun server.js"` (no "type" field)
   - `Dockerfile` – Alpine-based Bun image
   - `.dockerignore` – Build-time cleanup
   - `railway.json` – Railway platform config
5. **Commits if changed** – Commits bundle changes and superproject pointer bump
6. **Pushes if requested** – With `--push` flag, pushes both branches

### Idempotency

The script is **safe to run repeatedly**:
- Checks for staged changes before each commit
- Reports "no changes" if nothing new
- Exit code 0 on success

### Usage

```bash
# Build locally (no push)
node scripts/build-bundle.mjs

# Build and push to remote
node scripts/build-bundle.mjs --push
```

### Output

After running, you can test the bundle locally:

```bash
cd bundle
bun start
# Open http://localhost:3000 — backend serves the UI + API
```

### For CI

Recommended in CI/CD pipelines:

```bash
# In GitHub Actions or similar
node scripts/build-bundle.mjs --push
```

This ensures the `bundle` branch is always up-to-date with the latest source layers and can be deployed immediately.
