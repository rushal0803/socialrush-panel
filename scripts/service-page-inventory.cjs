// Read-only inventory of configured routes; no database credentials are read.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const root = process.cwd();
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { activeSmmServices } = require('../lib/smm-service-catalog.ts');
const { seoServiceSlugs } = require('../lib/seo/service-landing-pages.ts');
const { canonicalIndiaServicePaths, indiaServiceSlugs } = require('../lib/seo/canonical-india-services.ts');
const { countryServicePaths } = require('../lib/seo/international.ts');
const { growthServices } = require('../lib/growth-services.ts');
const paths = new Set([...seoServiceSlugs.map(s => `/${s}`), ...indiaServiceSlugs.map(s => `/${s}`), '/buy-youtube-watch-hours-india', ...Object.values(canonicalIndiaServicePaths), ...countryServicePaths, ...activeSmmServices.map(s => `/services/${s.code}`), ...growthServices.map(s => `/services/${s.slug}`), '/services/smm-panel-india', '/youtube-watch-hours']);
const inventory = {
  configuredServicePaths: paths.size,
  note: 'Includes redirect aliases and catalog-only routes; live-only availability requires an active production row. Not a count of indexed pages.',
  platforms: Object.fromEntries([...new Set(activeSmmServices.map(s => s.platform))].map(p => [p, activeSmmServices.filter(s => s.platform === p).map(s => ({ code: s.code, liveOnly: Boolean(s.requiresLiveCatalogFacts) }))])),
  countryPages: countryServicePaths.length,
  paths: [...paths].sort(),
};
process.stdout.write(JSON.stringify(inventory, null, 2) + '\n');
