# Snip Backend

A tiny URL shortener backend built with Bun, zero npm dependencies.

## Quick Start

```bash
bun start
```

The server runs on port 3000 (configurable via `PORT` env var).

## API

### POST /api/links
Create a shortened link.

**Request:**
```json
{ "url": "https://example.com/very/long/path" }
```

**Response (201):**
```json
{
  "code": "aB3xYz",
  "url": "https://example.com/very/long/path",
  "shortUrl": "http://localhost:3000/aB3xYz",
  "hits": 0,
  "createdAt": "2026-08-13T12:34:56.789Z"
}
```

**Error (400):** Invalid JSON or non-http(s) URL

### GET /api/links
List all shortened links.

**Response (200):**
```json
[
  { "code": "aB3xYz", "url": "...", "shortUrl": "...", "hits": 0, "createdAt": "..." },
  { "code": "cD9uvW", "url": "...", "shortUrl": "...", "hits": 5, "createdAt": "..." }
]
```

### GET /:code
Redirect to the original URL.

**Response (302):** Redirects to original URL; increments hit counter
**Error (404):** Unknown short code

## Configuration

Environment variables:
- `PORT` – Server port (default: 3000)
- `BASE_URL` – Origin for shortUrl values (default: http://localhost:3000; falls back to https://$RAILWAY_PUBLIC_DOMAIN if set)
- `PUBLIC_DIR` – Serve static files from this directory (optional); "/" maps to index.html

## Features

- ✅ In-memory link storage (resets on restart)
- ✅ 6-character base62 random codes
- ✅ CORS + OPTIONS preflight support
- ✅ Environment-based configuration
- ✅ Optional static file serving
- ✅ Zero npm dependencies (Bun built-ins only)
