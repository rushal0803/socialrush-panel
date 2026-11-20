// Local synthetic launcher only: never load tracked/ambient payment or backend
// .env files. Keep Next's public API return shape; reverify on Next upgrades.
const filename = require.resolve('@next/env');
const original = require(filename);
require.cache[filename].exports = {
  ...original,
  loadEnvConfig: () => ({ combinedEnv: process.env, parsedEnv: {}, loadedEnvFiles: [] }),
  processEnv: () => [process.env, {}],
};
