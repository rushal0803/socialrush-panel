import assert from "node:assert/strict";
import test from "node:test";
import { filterOperationalLeadItems, isInternalOperationalTestLead, istDayBounds, operationalLeadIds } from "@/lib/crm/operational";

const internal = { id: "internal", source_name: "Internal Resend E2E Test", business_name: "SocialRUSH Internal Test" };
const real = { id: "real", source_name: "website", business_name: "Real Prospect" };

test("internal Resend E2E lead is excluded while a real lead remains operational", () => {
  assert.equal(isInternalOperationalTestLead(internal), true);
  assert.equal(isInternalOperationalTestLead(real), false);
  assert.deepEqual([...operationalLeadIds([internal, real])], ["real"]);
});

test("internal replies and lead follow-ups do not affect operational counts", () => {
  const ids = operationalLeadIds([internal, real]);
  assert.equal(filterOperationalLeadItems([{ lead_id: "internal", classification: "interested" }, { lead_id: "real", classification: "interested" }], ids).length, 1);
  assert.equal(filterOperationalLeadItems([{ lead_id: "internal", due_at: "2026-09-04T00:00:00Z" }, { lead_id: "real", due_at: "2026-09-04T00:00:00Z" }], ids).length, 1);
});

test("IST day boundary remains correct around midnight", () => {
  const beforeMidnight = istDayBounds(new Date("2026-09-04T18:29:59Z"));
  const afterMidnight = istDayBounds(new Date("2026-09-04T18:30:00Z"));
  assert.equal(beforeMidnight.start, "2026-09-03T18:30:00.000Z");
  assert.equal(afterMidnight.start, "2026-09-04T18:30:00.000Z");
});
