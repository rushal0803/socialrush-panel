// Test-only resolution of tsconfig aliases and extensionless relative imports
// for Node's type-strip runner. Next's application resolver remains unchanged.
import { registerHooks } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
registerHooks({ resolve(specifier, context, nextResolve) {
  const alias = specifier.startsWith('@/');
  const relative = specifier.startsWith('./') || specifier.startsWith('../');
  if (!alias && !relative) return nextResolve(specifier, context);
  const target = alias
    ? new URL(`../${specifier.slice(2)}`, import.meta.url)
    : new URL(specifier, context.parentURL);
  for (const suffix of ['', '.ts', '.tsx', '.js', '/index.ts']) {
    const candidate = new URL(target.href + suffix);
    if (existsSync(fileURLToPath(candidate)) && statSync(fileURLToPath(candidate)).isFile()) return nextResolve(candidate.href, context);
  }
  return nextResolve(target.href, context);
} });
