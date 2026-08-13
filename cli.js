#!/usr/bin/env node

const apiBase = process.env.SNIP_API || 'http://localhost:3000';

async function createLink(url) {
  try {
    const response = await fetch(`${apiBase}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Error: ${error.error || 'Failed to create link'}`);
      process.exit(1);
    }

    const link = await response.json();
    console.log(link.shortUrl);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function listLinks() {
  try {
    const response = await fetch(`${apiBase}/api/links`);

    if (!response.ok) {
      console.error('Error: Failed to fetch links');
      process.exit(1);
    }

    const links = await response.json();

    if (links.length === 0) {
      console.log('No links yet.');
      return;
    }

    // Calculate column widths
    const codeWidth = Math.max(6, Math.max(...links.map(l => l.code.length)));
    const hitsWidth = Math.max(4, Math.max(...links.map(l => l.hits.toString().length)));
    const urlWidth = Math.max(3, Math.max(...links.map(l => l.url.length)));

    // Print header
    const header = `${'Code'.padEnd(codeWidth)}  ${'Hits'.padEnd(hitsWidth)}  URL`;
    console.log(header);
    console.log('-'.repeat(header.length));

    // Print rows
    links.forEach(link => {
      const row = `${link.code.padEnd(codeWidth)}  ${link.hits.toString().padEnd(hitsWidth)}  ${link.url}`;
      console.log(row);
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function openLink(code) {
  try {
    const response = await fetch(`${apiBase}/${code}`, {
      redirect: 'manual',
    });

    if (response.status === 404) {
      console.error(`Error: Unknown code '${code}'`);
      process.exit(1);
    }

    if (response.status !== 302) {
      console.error(`Error: Unexpected response (${response.status})`);
      process.exit(1);
    }

    const targetUrl = response.headers.get('location');
    if (!targetUrl) {
      console.error('Error: No redirect location provided');
      process.exit(1);
    }

    openBrowser(targetUrl);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function openBrowser(url) {
  const { execSync } = require('child_process');
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      execSync(`open "${url}"`);
    } else if (platform === 'win32') {
      execSync(`start "${url}"`);
    } else {
      // Linux and other Unix-like systems
      execSync(`xdg-open "${url}"`);
    }
  } catch (err) {
    console.error(`Error: Failed to open browser - ${err.message}`);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`Snip - URL Shortener CLI

Usage:
  snip add <url>     Create a short link
  snip ls            List all links
  snip open <code>   Open a short link in the browser
  snip help          Show this message

Environment:
  SNIP_API           Backend URL (default: http://localhost:3000)

Examples:
  snip add https://example.com/very/long/path
  snip ls
  snip open abc123`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return;
  }

  const command = args[0];
  const arg = args[1];

  if (command === 'add') {
    if (!arg) {
      console.error('Error: URL required');
      console.error('Usage: snip add <url>');
      process.exit(1);
    }
    await createLink(arg);
  } else if (command === 'ls') {
    await listLinks();
  } else if (command === 'open') {
    if (!arg) {
      console.error('Error: Code required');
      console.error('Usage: snip open <code>');
      process.exit(1);
    }
    await openLink(arg);
  } else {
    console.error(`Error: Unknown command '${command}'`);
    console.error("Run 'snip help' for usage information");
    process.exit(1);
  }
}

main();
