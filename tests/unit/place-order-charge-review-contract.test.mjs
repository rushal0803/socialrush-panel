import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

const sql = readFileSync(new URL("../../docs/audits/place-order-charge-correction-REVIEW-ONLY.sql", import.meta.url), "utf8");

test("review-only checkout correction supplies charge and preserves wallet lock", () => {
  assert.match(sql, /REVIEW ONLY\. NOT A MIGRATION/);
  assert.match(sql, /for update;/i);
  assert.match(sql, /v_charge := round\(\(p_quantity::numeric \/ 1000\) \* v_service\.rate, 2\)/);
  assert.match(sql, /insert into public\.orders \(user_id, service_id, link, quantity, charge\)\s*values \(v_user_id, p_service_id, trim\(p_link\), p_quantity, v_charge\)/i);
  assert.match(sql, /values \(v_user_id, v_charge, 'debit', 'completed'\)/);
});
