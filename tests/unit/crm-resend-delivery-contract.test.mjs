import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../lib/crm/resend.ts", import.meta.url), "utf8");

test("Resend customer delivery events do not infer delivered from engagement", () => {
  const opened = source.match(/else if\(eventType==="email\.opened"\)\{([\s\S]*?)\}else if\(eventType==="email\.clicked"\)/)?.[1];
  const clicked = source.match(/else if\(eventType==="email\.clicked"\)\{([\s\S]*?)\}else if\(eventType==="email\.bounced"\)/)?.[1];
  assert.ok(opened, "email.opened customer event branch must exist");
  assert.ok(clicked, "email.clicked customer event branch must exist");
  assert.doesNotMatch(opened, /patch\.delivery_status\s*=/);
  assert.doesNotMatch(clicked, /patch\.delivery_status\s*=/);
  assert.match(opened, /patch\.opened_at\s*=/);
  assert.match(clicked, /patch\.clicked_at\s*=/);
});

test("Only explicit delivered event marks a customer email delivered", () => {
  const delivered = source.match(/if\(eventType==="email\.delivered"\)\{([\s\S]*?)\}else if\(eventType==="email\.opened"\)/)?.[1];
  assert.ok(delivered, "email.delivered customer event branch must exist");
  assert.match(delivered, /patch\.delivery_status="delivered"/);
});
