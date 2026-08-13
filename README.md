# Snip: One Backend, Two Clients

A complete URL shortener application demonstrating git submodule architecture. One backend API server, two very different clients (web UI + CLI), all consuming the same contract in a single repository organized as independent branches mounted by a superproject.

## Architecture

```
snip-demo/
├── backend/        Bun API server (zero deps, in-memory Map)
│   ├── server.js
│   └── package.json
├── frontend/       Angular 19 web app (Lovable-inspired design)
│   ├── src/
│   ├── angular.json
│   └── package.json
├── cli/            Zero-dependency Node CLI
│   ├── cli.js
│   ├── snip / snip.cmd / snip.ps1  (wrappers)
│   └── package.json
└── main/           Superproject (this branch)
    ├── .gitmodules  (submodule pointers)
    └── README.md
```

Each layer lives on its own **orphan branch** (independent git history, files at the branch root). The `main` branch mounts them all as **gitlinks** — exact SHA pointers stored in `.gitmodules`.

### Why Submodules?

- **Independent versions**: Each layer evolves separately on its own branch
- **Reproducible snapshots**: `main` pins exact commits; no "latest code" surprises
- **Real on GitHub**: Folders appear clickable; clones materialize the whole app side-by-side
- **Parallel development**: Teams can work on backend, frontend, CLI in isolation
- **Painless CI/CD**: Automated bundle releases can pick specific layer versions

## API Contract

All clients consume this exact HTTP API (same schema, same status codes):

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| **POST** | `/api/links` | `{ "url": "https://…" }` | `201 { code, url, shortUrl, hits, createdAt }` | Validates http/https only; 400 on invalid |
| **GET** | `/api/links` | — | `200 [{ code, url, shortUrl, hits, createdAt }, …]` | Returns all links as array |
| **GET** | `/:code` | — | `302` redirect to original URL | Increments `hits`; 404 if unknown |

### Data Shape

```json
{
  "code": "aB3xYz",              // 6-char base62 random
  "url": "https://example.com",  // Original URL
  "shortUrl": "http://localhost:3000/aB3xYz",  // Full short link
  "hits": 5,                     // Redirect count (starts at 0)
  "createdAt": "2026-08-13T12:34:56.789Z"  // ISO timestamp
}
```

## Getting Started

### Clone with Submodules

```bash
git clone --recurse-submodules https://github.com/kmchanaa/snip-demo.git
cd snip-demo
```

**Note**: Plain `git clone` leaves `backend/`, `frontend/`, `cli/` empty. Always use `--recurse-submodules` (or run `git submodule update --init --recursive` after cloning).

### Run All Three

Open three terminals from the `main` checkout:

#### Terminal 1: Backend (port 3000)
```bash
cd backend
bun start
# Output: 🚀 Snip server running on http://localhost:3000
```

#### Terminal 2: Frontend (port 4200)
```bash
cd frontend
npm install  # First time only
npx ng serve
# Navigate to http://localhost:4200
# Paste URLs, see short codes, click to test redirects
```

#### Terminal 3: CLI
```bash
cd cli
# List links
node cli.js ls

# Create a short link
node cli.js add https://github.com/kenken64/snip-demo

# Open in browser
node cli.js open <code>

# Get help
node cli.js help
```

## Workflows

### Adding a Feature to the Backend

1. **Edit inside the submodule**:
   ```bash
   cd backend
   # Edit server.js
   git add -A
   git commit -m "Add feature"
   git push origin backend
   ```

2. **Update the pointer in main**:
   ```bash
   cd ..  # back to superproject
   git submodule update --remote backend
   git add backend
   git commit -m "Bump backend submodule"
   git push origin main
   ```

   Now `main` pins the new backend commit. Anyone cloning sees the latest code.

### Updating Frontend Design

Same pattern — edit inside `frontend/`, commit, push. Then bump the pointer on `main`:

```bash
cd frontend
# Edit src/app/app.component.css
npm run build  # Verify build passes
git add -A && git commit -m "Improve styling"
git push origin frontend

cd ..
git submodule update --remote frontend
git add frontend
git commit -m "Bump frontend submodule"
git push origin main
```

### Adding a CLI Command

```bash
cd cli
# Edit cli.js
node cli.js help  # Test
git add -A && git commit -m "Add new command"
git push origin cli

cd ..
git submodule update --remote cli
git add cli
git commit -m "Bump cli submodule"
git push origin main
```

## Branch Structure

| Branch | Purpose | Files | History |
|--------|---------|-------|---------|
| `backend` | Bun API server | server.js, package.json | Orphan (independent) |
| `frontend` | Angular web UI | src/, angular.json, design.md | Orphan (independent) |
| `cli` | Node CLI tool | cli.js, snip.cmd, snip.ps1 | Orphan (independent) |
| `main` | Superproject aggregator | .gitmodules, README.md | Orphan (independent) |

Each branch has no parent commit; they're completely separate histories. This keeps each layer lean and decoupled.

## Storage & Persistence

- **In-memory Map** – Links are stored in RAM, cleared on server restart (by design)
- **Perfect for demos** – No database setup needed
- **Upgrade path** – Swap the Map for a real database later without changing the API

## Environment Configuration

### Backend

- `PORT` – Server port (default: 3000)
- `BASE_URL` – Origin for short URLs (default: http://localhost:3000; falls back to `https://$RAILWAY_PUBLIC_DOMAIN` if set)
- `PUBLIC_DIR` – Optional: Serve static files from this directory (used in bundled release)

### CLI

- `SNIP_API` – Backend URL (default: http://localhost:3000)

### Frontend

Hardcoded to `http://localhost:3000` in development; can be switched to any backend URL.

## Testing the Round-Trip

To verify everything works end-to-end:

```bash
# 1. Start backend in background
cd backend && bun start &

# 2. Start frontend in background
cd ../frontend && npm install && npx ng serve &

# 3. Smoke test via CLI
cd ../cli
node cli.js add https://example.com/long/path  # Get short code
node cli.js ls                                   # See it in the table
node cli.js open <code>                          # Opens browser

# 4. Verify it appears in all three places:
#    - Web UI: http://localhost:4200 → see short code
#    - CLI: node cli.js ls → see in table
#    - Backend: curl http://localhost:3000/api/links → in JSON array
```

## Git Concepts

### Gitlinks

In `main`, each folder is a **gitlink** — a special git object (type 160000) pinning an exact commit:

```bash
git ls-tree main
# 160000 commit abc123def456...  backend
# 160000 commit xyz789012345...  frontend
# 160000 commit qwe456rty789...  cli
```

These are **not** symlinks or cloned folders — they're pointers that git resolves on clone.

### .gitmodules

```
[submodule "backend"]
	path = backend
	url = https://github.com/kmchanaa/snip-demo.git
	branch = backend
[submodule "frontend"]
	path = frontend
	url = https://github.com/kmchanaa/snip-demo.git
	branch = frontend
[submodule "cli"]
	path = cli
	url = https://github.com/kmchanaa/snip-demo.git
	branch = cli
```

The `branch = ...` line tells git which branch each submodule tracks. `git submodule update --remote` pulls the latest from those branches.

## Common Tasks

### Update all submodules to latest
```bash
git submodule update --init --recursive  # Clone/init if needed
git submodule update --remote            # Fetch latest from tracking branches
```

### Check submodule status
```bash
git submodule status
# Shows: [commit] path/to/submodule (branch-name)
```

### See what changed in a submodule
```bash
cd backend
git log --oneline -5  # Last 5 commits on backend branch
```

## Deployment

Later steps show how to:
- Assemble a **bundle** branch (combining backend + built frontend + CLI into one release)
- Build a **Docker image** from the bundle
- Deploy to platforms like Railway

This architecture makes it easy to version and release different layer combinations.

## Next Steps

This repo is complete as-is for local development. To extend it:

1. **Add persistence**: Replace in-memory Map with a real database (PostgreSQL, Firestore, etc.)
2. **Scale the frontend**: Add more pages, features, real-time updates
3. **Enhance the CLI**: Add batch operations, config files, shell completions
4. **Add automated tests**: Jest for backend, Karma for frontend, mocha for CLI
5. **Deploy**: Package into a Docker image and push to a registry (GHCR, Docker Hub, etc.)

---

**Architecture**: One repo, four orphan branches, three clients, one backend, zero dependencies. 🚀
