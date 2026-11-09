import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const health = readFileSync(new URL("../../app/admin/crm/automation-health/page.tsx", import.meta.url), "utf8");
const overview = readFileSync(new URL("../../app/admin/crm/page.tsx", import.meta.url), "utf8");

test("CRM automation health does not misreport missing or failed settings as Off", () => {
  assert.match(health, /outreachSettings\.error\s*\|\|\s*!outreachSettings\.data\s*\?\s*"Unavailable"/);
  assert.match(health, /outreachSettings\.data\.enabled\s*&&\s*outreachSettings\.data\.auto_send\s*\?\s*"On"\s*:\s*"Off"/);
});

test("CRM overview explicitly warns about incomplete customer counts and query failures", () => {
  assert.match(overview, /customerCountMayBeTruncated=profiles\.length>=1000/);
  assert.match(overview, /queryFailures\.length>0/);
  assert.match(overview, /Some CRM data could not be loaded/);
});

test("automation health dashboard remains read-only", () => {
  assert.doesNotMatch(health, /\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.rpc\s*\(/);
});
