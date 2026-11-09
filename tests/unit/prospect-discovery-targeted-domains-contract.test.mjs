import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(new URL("../../lib/crm/prospect-discovery.ts", import.meta.url), "utf8");

test("discovery uses targeted duplicate checks instead of full-table domain scans", () => {
  assert.doesNotMatch(source, /from\("crm_lead_candidates"\)\.select\("domain"\)/);
  assert.doesNotMatch(source, /from\("crm_leads"\)\.select\("domain"\)/);
  assert.match(source, /async function alreadyKnownDomain\(domain: string\)/);
  assert.match(source, /if \(await alreadyKnownDomain\(website\.domain\)\)/);
  assert.match(source, /\.eq\("domain", domain\)\.limit\(1\)/);
  assert.match(source, /if \(candidates\.error \|\| leads\.error\) throw/);
  assert.match(source, /error\?\.code === "23505"/);
});
