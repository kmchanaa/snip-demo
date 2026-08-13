#!/usr/bin/env node
/**
 * build-bundle.mjs
 * 
 * Assemble Snip bundle: combine backend + built frontend + CLI into a release branch.
 * 
 * Usage:
 *   node scripts/build-bundle.mjs          # Build locally (no push)
 *   node scripts/build-bundle.mjs --push   # Build and push to remote
 * 
 * Idempotent: Safe to run repeatedly. Only commits if changes exist.
 */

import { execSync, spawnSync } from 'child_process';
import { cpSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const isPush = process.argv.includes('--push');
const cwd = process.cwd();

console.log('🔨 Building Snip bundle...\n');

// Step 1: Update submodules
console.log('1️⃣  Updating submodules to branch tips...');
try {
  execSync('git submodule update --init --remote backend frontend cli', {
    cwd,
    stdio: 'inherit',
  });
} catch (err) {
  console.error('❌ Failed to update submodules');
  process.exit(1);
}

// Step 2: Build frontend
console.log('\n2️⃣  Building frontend...');
try {
  execSync('npm install', { cwd: join(cwd, 'frontend'), stdio: 'inherit' });
  execSync('npx ng build', { cwd: join(cwd, 'frontend'), stdio: 'inherit' });
} catch (err) {
  console.error('❌ Frontend build failed');
  process.exit(1);
}

// Verify build output
const buildOutput = join(cwd, 'frontend', 'dist', 'snip-frontend', 'browser', 'index.html');
if (!existsSync(buildOutput)) {
  console.error('❌ Build output missing:', buildOutput);
  process.exit(1);
}
console.log('✓ Frontend build successful');

// Step 3: Assemble bundle
console.log('\n3️⃣  Assembling bundle...');
const bundleDir = join(cwd, 'bundle');
mkdirSync(bundleDir, { recursive: true });

// Copy backend server.js
console.log('  - Copying backend/server.js');
cpSync(join(cwd, 'backend', 'server.js'), join(bundleDir, 'server.js'));

// Copy CLI
console.log('  - Copying cli/cli.js');
cpSync(join(cwd, 'cli', 'cli.js'), join(bundleDir, 'cli.js'));

// Copy frontend build output
console.log('  - Copying frontend build output to public/');
const publicDir = join(bundleDir, 'public');
cpSync(join(cwd, 'frontend', 'dist', 'snip-frontend', 'browser'), publicDir, {
  recursive: true,
  force: true,
});

// Create .env
console.log('  - Creating .env with PUBLIC_DIR=./public');
writeFileSync(join(bundleDir, '.env'), 'PUBLIC_DIR=./public\n');

// Create package.json
console.log('  - Creating package.json for Bun');
const bundlePackageJson = {
  name: 'snip-bundle',
  version: '1.0.0',
  description: 'Snip - Complete bundle (backend + frontend + CLI)',
  scripts: {
    start: 'bun server.js',
  },
  keywords: ['url-shortener', 'snip', 'bundle'],
  author: '',
  license: 'MIT',
};
writeFileSync(
  join(bundleDir, 'package.json'),
  JSON.stringify(bundlePackageJson, null, 2) + '\n'
);

// Create Dockerfile
console.log('  - Creating Dockerfile');
const dockerfile = `FROM oven/bun:1-alpine

WORKDIR /app

# Copy all bundle contents
COPY . .

# Environment
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run server
CMD ["bun", "server.js"]
`;
writeFileSync(join(bundleDir, 'Dockerfile'), dockerfile);

// Create .dockerignore
console.log('  - Creating .dockerignore');
const dockerignore = `node_modules
.git
.gitignore
.DS_Store
*.log
npm-debug.log*
`;
writeFileSync(join(bundleDir, '.dockerignore'), dockerignore);

// Create railway.json
console.log('  - Creating railway.json');
const railwayJson = {
  builder: 'DOCKERFILE',
};
writeFileSync(join(bundleDir, 'railway.json'), JSON.stringify(railwayJson, null, 2) + '\n');

console.log('✓ Bundle assembly complete');

// Step 4: Commit in bundle submodule
console.log('\n4️⃣  Committing bundle changes...');
try {
  // Check if there are changes to commit
  const statusResult = spawnSync('git', ['status', '--porcelain'], {
    cwd: bundleDir,
    encoding: 'utf-8',
  });

  const hasChanges = statusResult.stdout.trim().length > 0;

  if (hasChanges) {
    console.log('  - Changes detected, staging and committing...');
    execSync('git add -A', { cwd: bundleDir, stdio: 'inherit' });
    
    // Check staged changes before committing
    const diffCachedResult = spawnSync('git', ['diff', '--cached', '--stat'], {
      cwd: bundleDir,
      encoding: 'utf-8',
    });
    console.log(diffCachedResult.stdout);

    execSync('git commit -m "Generated bundle output"', {
      cwd: bundleDir,
      stdio: 'inherit',
    });
    console.log('✓ Bundle committed');
  } else {
    console.log('  - No changes in bundle (idempotent)');
  }
} catch (err) {
  // git commit returns non-zero if nothing to commit (expected)
  if (err.toString().includes('nothing to commit')) {
    console.log('  - No changes to commit (idempotent)');
  } else {
    console.error('❌ Failed to commit bundle changes');
    process.exit(1);
  }
}

// Step 5: Update bundle submodule pointer in main
console.log('\n5️⃣  Updating bundle submodule pointer in superproject...');
try {
  // Check if there are changes to bundle pointer
  const statusResult = spawnSync('git', ['status', '--porcelain'], {
    cwd,
    encoding: 'utf-8',
  });

  const hasChanges = statusResult.stdout.includes('bundle');

  if (hasChanges) {
    console.log('  - Bundle pointer changed, staging...');
    execSync('git add bundle', { cwd, stdio: 'inherit' });
    
    // Check staged changes
    const diffCachedResult = spawnSync('git', ['diff', '--cached', '--stat'], {
      cwd,
      encoding: 'utf-8',
    });
    console.log(diffCachedResult.stdout);

    execSync('git commit -m "Bump bundle submodule"', { cwd, stdio: 'inherit' });
    console.log('✓ Superproject pointer updated');
  } else {
    console.log('  - No bundle pointer changes (idempotent)');
  }
} catch (err) {
  if (err.toString().includes('nothing to commit')) {
    console.log('  - No pointer changes (idempotent)');
  } else {
    console.error('❌ Failed to update superproject');
    process.exit(1);
  }
}

// Step 6: Push if requested
if (isPush) {
  console.log('\n6️⃣  Pushing to remote...');
  try {
    // Push bundle (note: detached HEAD is common in submodules)
    console.log('  - Pushing bundle branch');
    execSync('git push -u origin HEAD:bundle', { cwd: bundleDir, stdio: 'inherit' });
    
    // Push main
    console.log('  - Pushing main branch');
    execSync('git push -u origin main', { cwd, stdio: 'inherit' });
    
    console.log('✓ Pushed to remote');
  } catch (err) {
    console.error('❌ Failed to push');
    process.exit(1);
  }
} else {
  console.log('\n💾 (Not pushing — use --push flag to push to remote)');
}

console.log('\n✅ Bundle build complete!\n');
