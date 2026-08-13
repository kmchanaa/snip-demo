# Snip CLI

A zero-dependency Node.js command-line tool for the Snip URL shortener backend.

## Installation

```bash
node cli.js [command] [args]
# or via bin entry:
npm link  # Makes 'snip' command available globally
```

## Commands

### `snip add <url>`
Create a shortened link and print the short URL.

```bash
snip add https://example.com/very/long/path
# Output: http://localhost:3000/abc123
```

### `snip ls`
List all shortened links in an aligned table.

```bash
snip ls
# Output:
# Code  Hits  URL
# -----  ----  ---
# abc123   5   https://example.com/very/long/path
# def456   2   https://github.com/...
```

Prints "No links yet." if empty.

### `snip open <code>`
Open a short link in the OS default browser.

```bash
snip open abc123
# Opens http://localhost:3000/abc123 → redirects to original URL in browser
```

### `snip help`
Print usage information.

## Environment

- **SNIP_API** – Backend base URL (default: `http://localhost:3000`)

```bash
SNIP_API=https://my-snip.example.com snip ls
```

## Error Handling

- Invalid input, unknown codes, or backend errors print to stderr and exit with code 1
- Success exits with code 0

## Technical Details

- **Zero dependencies** – Uses only Node.js built-ins + global `fetch` (Node 18+)
- **CommonJS** – No ES modules (`package.json` has no `"type": "module"`)
- **Cross-platform** – Works on Windows (CMD/PowerShell), macOS, Linux
- **Wrappers** – Tiny scripts (`snip`, `snip.cmd`, `snip.ps1`) forward to `cli.js`

## Testing

```bash
node cli.js help                              # Print usage
node cli.js ls                                # List (fails cleanly if backend down)
SNIP_API=http://localhost:3000 node cli.js ls  # Point to custom backend
```
