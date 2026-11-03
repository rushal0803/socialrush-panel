// Discover every unit regression; avoid a manually maintained subset hiding failures.
const { readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const files = readdirSync('tests/unit').filter(file => /\.test\.(ts|mjs|cjs)$/.test(file)).sort().map(file => `tests/unit/${file}`);
if (!files.length) throw new Error('No unit tests discovered');
console.log(`Discovered ${files.length} unit test files`);
const result = spawnSync(process.execPath, ['--experimental-strip-types', '--import', './scripts/test-path-aliases.mjs', '--test', ...files], { stdio: 'inherit', shell: false });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
