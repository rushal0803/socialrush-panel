import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const matrix = readFileSync(new URL("../../docs/audits/legacy-place-order-isolated-test-matrix.md", import.meta.url), "utf8");
const preflight = readFileSync(new URL("../../docs/audits/legacy-place-order-readonly-preflight.sql", import.meta.url), "utf8");

test("checkout release gate covers charge, rollback, concurrency and trigger effects", () => {
  for (const phrase of ["non-null charge", "Insufficient balance", "NULL quantities", "Concurrent requests", "Repeated request/idempotency", "Rollback after downstream trigger error", "notification/email outbox", "anonymous access denied"]) {
    assert.ok(matrix.toLowerCase().includes(phrase.toLowerCase()), `missing acceptance gate: ${phrase}`);
  }
});

test("database preflight remains read-only and checks function security and order triggers", () => {
  assert.match(preflight, /pg_get_functiondef\(/);
  assert.match(preflight, /information_schema\.triggers/);
  assert.match(preflight, /routine_privileges/);
  assert.doesNotMatch(preflight, /\b(?:INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+OR\s+REPLACE|DROP\s+TABLE|ALTER\s+TABLE|GRANT\s+EXECUTE)\b/i);
});
