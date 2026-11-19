/*
  PostCSS usage verification script
  Checks:
  1. postcss listed in package.json (dependencies or devDependencies)
  2. postcss.config.cjs file exists
  3. vite.config.js (or other build config) references postcss (optional)

  Run with: node scripts/checkPostcssUsage.js
*/
const fs = require('fs');
const path = require('path');

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function checkPackageJson() {
  const pkgPath = path.resolve(__dirname, '../server/package.json');
  if (!fileExists(pkgPath)) {
    console.error('❌ package.json not found at', pkgPath);
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const hasPostcss = (pkg.dependencies && pkg.dependencies.postcss) ||
                     (pkg.devDependencies && pkg.devDependencies.postcss);
  console.log(`postcss in package.json: ${hasPostcss ? 'yes' : 'no'}`);
  return !!hasPostcss;
}

function checkConfigFile() {
  const configPath = path.resolve(__dirname, '../client/postcss.config.cjs');
  const exists = fileExists(configPath);
  console.log(`postcss.config.cjs exists: ${exists ? 'yes' : 'no'}`);
  return exists;
}

function checkViteConfig() {
  const vitePath = path.resolve(__dirname, '../client/vite.config.js');
  if (!fileExists(vitePath)) {
    console.log('vite.config.js not found – Vite will auto‑load postcss.config.cjs if present');
    return true;
  }
  const content = fs.readFileSync(vitePath, 'utf8');
  const uses = /postcss\s*:/i.test(content) || /postcssConfig/i.test(content);
  console.log(`postcss referenced in vite.config.js: ${uses ? 'yes' : 'no'}`);
  return uses;
}

const pkgOk = checkPackageJson();
const cfgOk = checkConfigFile();
const viteOk = checkViteConfig();

if (pkgOk && cfgOk && viteOk) {
  console.log('✅ PostCSS appears to be set up correctly.');
  process.exit(0);
} else {
  console.warn('⚠️ PostCSS setup may be incomplete.');
  process.exit(1);
}

