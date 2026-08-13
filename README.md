# Snip Frontend

A minimal Angular 19 web UI for the Snip URL shortener, communicating with the backend at `http://localhost:3000`.

## Features

- ✅ Form to paste a URL (validates http/https client-side)
- ✅ Shows shortened link on success, API/network errors inline
- ✅ Table of all links: short code (linked to shortUrl), original URL, hit count
- ✅ Signals for state management
- ✅ One standalone component + one service
- ✅ Clean minimal CSS

## Development

```bash
npm install
npm start
```

Then open `http://localhost:4200` in your browser. The app talks to the backend at `http://localhost:3000/api/links`.

## Build

```bash
npm run build
```

The build output lands in `dist/snip-frontend/browser/` — **this path is load-bearing for later steps.**

## Testing

```bash
npm test
```
