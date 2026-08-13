// Snip: Tiny URL shortener backend
// Single-file Bun server with zero npm dependencies

const links = new Map(); // Store shortened links

// Generate random base62 code
function generateCode(length = 6) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Validate URL
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Parse environment variables
const PORT = parseInt(process.env.PORT || '3000', 10);
const RAILWAY_PUBLIC_DOMAIN = process.env.RAILWAY_PUBLIC_DOMAIN;
const BASE_URL =
  process.env.BASE_URL ||
  (RAILWAY_PUBLIC_DOMAIN ? `https://${RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');
const PUBLIC_DIR = process.env.PUBLIC_DIR;

function getContentType(path) {
  if (path.endsWith('.html')) return 'text/html; charset=utf-8';
  if (path.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.json')) return 'application/json; charset=utf-8';
  if (path.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

// Serve static files if PUBLIC_DIR is set
async function serveStaticFile(pathname) {
  if (!PUBLIC_DIR) return null;

  try {
    const path = pathname === '/' ? '/index.html' : pathname;
    const filePath = PUBLIC_DIR.replace(/\/$/, '') + path;
    const file = Bun.file(filePath);
    const exists = await file.exists();
    return exists ? { file, path } : null;
  } catch {
    return null;
  }
}

// Parse JSON body safely
async function parseJsonBody(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

// Create the Bun server
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // POST /api/links - Create a shortened link
    if (method === 'POST' && pathname === '/api/links') {
      const body = await parseJsonBody(req);

      if (!body || typeof body.url !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON or missing url field' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const { url: urlString } = body;

      if (!isValidUrl(urlString)) {
        return new Response(
          JSON.stringify({ error: 'Invalid URL: must be http or https' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Generate unique code
      let code;
      do {
        code = generateCode();
      } while (links.has(code));

      const link = {
        code,
        url: urlString,
        shortUrl: `${BASE_URL}/${code}`,
        hits: 0,
        createdAt: new Date().toISOString(),
      };

      links.set(code, link);

      return new Response(JSON.stringify(link), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // GET /api/links - List all links
    if (method === 'GET' && pathname === '/api/links') {
      return new Response(JSON.stringify(Array.from(links.values())), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Serve the bundled UI before treating paths as short codes.
    if (method === 'GET') {
      const staticAsset = await serveStaticFile(pathname);
      if (staticAsset) {
        return new Response(staticAsset.file, {
          status: 200,
          headers: { 'Content-Type': getContentType(staticAsset.path), ...corsHeaders },
        });
      }
    }

    // GET /:code - Redirect to original URL
    if (method === 'GET' && pathname !== '/api/links' && pathname !== '/') {
      const code = pathname.slice(1); // Remove leading slash
      const link = links.get(code);

      if (link) {
        link.hits++;
        return new Response(null, {
          status: 302,
          headers: {
            Location: link.url,
            ...corsHeaders,
          },
        });
      }

      return new Response(JSON.stringify({ error: 'Short code not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // GET / - Serve index.html or static file if PUBLIC_DIR is set
    if (method === 'GET') {
      const fallbackAsset = await serveStaticFile('/index.html');
      if (fallbackAsset) {
        return new Response(fallbackAsset.file, {
          status: 200,
          headers: { 'Content-Type': getContentType(fallbackAsset.path), ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
});

console.log(`🚀 Snip server running on ${BASE_URL}`);
console.log(`   API: POST /api/links, GET /api/links, GET /:code`);
if (PUBLIC_DIR) {
  console.log(`   Static files: ${PUBLIC_DIR}`);
}
