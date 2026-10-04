// Test-only resolution of tsconfig's @/* mapping for Node's type-strip runner.
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
registerHooks({ resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith('@/')) return nextResolve(specifier, context);
  const target = new URL(`../${specifier.slice(2)}`, import.meta.url);
  for (const suffix of ['', '.ts', '.tsx', '.js', '/index.ts']) {
    const candidate = new URL(target.href + suffix);
    if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
  }
  return nextResolve(target.href, context);
} });
