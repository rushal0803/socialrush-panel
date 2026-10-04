// Read-only evidence against the locally available merge base.
const cp = require('node:child_process');
const fs = require('node:fs');
const ts = require('typescript');
const path = require('node:path');
const Module = require('node:module');
const root = process.cwd();
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const base = cp.execFileSync('git', ['merge-base', 'HEAD', 'origin/main'], { encoding: 'utf8' }).trim();
const { publishedCountryServicePages } = require('../lib/seo/international.ts');
const protectedFiles = cp.execFileSync('git', ['ls-files', 'lib/seo', 'lib/supabase', 'lib/service-pricing.ts', 'lib/smm-service-catalog.ts', 'middleware.ts', 'next.config.*', 'app/robots.ts', 'app/sitemap.ts', 'app/api', 'app/auth', 'app/dashboard/new-order', 'package.json', 'package-lock.json'], { encoding: 'utf8' }).trim().split('\n');
const allowedTestOnlyChanges = [];
const changedProtected = protectedFiles.filter(file => {
  const original = cp.execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' }).replace(/\r\n/g, '\n');
  const current = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  if (file === 'package.json' && original !== current) {
    const before = JSON.parse(original), after = JSON.parse(current);
    if (after.scripts['test:cro'] !== 'node --experimental-strip-types --import ./scripts/test-path-aliases.mjs --test tests/unit/cro-personalization.test.ts') return true;
    after.scripts['test:cro'] = before.scripts['test:cro'];
    if (JSON.stringify(after) === JSON.stringify(before)) { allowedTestOnlyChanges.push('package.json: test:cro alias hook only; dependencies and production scripts unchanged'); return false; }
  }
  return original !== current;
});
const legacyFiles = ['tests/unit/cro-personalization.test.ts', 'tests/unit/country-service-seo.test.ts', 'lib/reseller/saved-monthly-plan.ts', 'lib/seo/international.ts'];
console.log(JSON.stringify({ base, protectedFileCount: protectedFiles.length, changedProtected, allowedTestOnlyChanges,
  legacyFiles: legacyFiles.map(file => ({ file, unchangedFromBase: !cp.execFileSync('git', ['diff', base, '--', file], { encoding: 'utf8' }).trim() })),
  overlongDescriptions: publishedCountryServicePages.filter(p => p.description.length > 180).map(p => ({ path: `/${p.market.slug}/${p.serviceSlug}`, length: p.description.length })),
}, null, 2));
if (changedProtected.length) process.exitCode = 1;
