import {
  canonicalOwnerForPath,
  hasUniqueQueryOwnership,
  transactionalQueryOwners,
} from "../lib/seo/query-ownership.ts";

const failures: string[] = [];

if (!hasUniqueQueryOwnership()) {
  failures.push("Query ownership registry has duplicate canonical paths, duplicate aliases, or alias/canonical collisions.");
}

for (const owner of transactionalQueryOwners) {
  if (!owner.canonicalPath.startsWith("/") || owner.canonicalPath.includes("?") || owner.canonicalPath.includes("#")) {
    failures.push(`${owner.id}: canonical path must be a clean root-relative URL (${owner.canonicalPath})`);
  }
  if (!owner.intent.trim()) {
    failures.push(`${owner.id}: intent is empty`);
  }
  for (const alias of owner.aliases) {
    const resolved = canonicalOwnerForPath(alias);
    if (!resolved || resolved.canonicalPath !== owner.canonicalPath) {
      failures.push(`${owner.id}: alias ${alias} does not resolve to ${owner.canonicalPath}`);
    }
  }
}

const catalogOnlyTikTokPaths = [
  "/services/tiktok-likes",
  "/services/tiktok-views",
  "/services/tiktok-custom-comments",
  "/services/tiktok-story-views",
  "/services/tiktok-saves",
] as const;

for (const path of catalogOnlyTikTokPaths) {
  if (canonicalOwnerForPath(path)) {
    failures.push(`${path}: catalog-only noindex route must not own an organic keyword intent`);
  }
}

if (failures.length) {
  console.error("Phase 26 keyword ownership check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS  ${transactionalQueryOwners.length} canonical keyword owners are unique and internally consistent.`);
}
