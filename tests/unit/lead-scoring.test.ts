import assert from "node:assert/strict";
import test from "node:test";
import { calculateLeadScore } from "@/lib/crm/lead-scoring";

const base = { classifications: [], hasVerifiedBusinessEmail: false, hasRecommendedService: false, usefulContactCount: 1, hasOutboundEngagement: false, isBlocked: false, stale: false };

test("interested verified lead is prioritized transparently", () => {
  const result = calculateLeadScore({ ...base, classifications: ["interested"], hasVerifiedBusinessEmail: true, hasRecommendedService: true, usefulContactCount: 2, hasOutboundEngagement: true });
  assert.equal(result.score, 75); assert.equal(result.grade, "warm"); assert.ok(result.reasons.some(reason => reason.reason === "Interested reply"));
});
test("unsubscribe is always do not contact", () => assert.equal(calculateLeadScore({ ...base, isBlocked: true }).grade, "do_not_contact"));
test("bounce is always do not contact", () => assert.equal(calculateLeadScore({ ...base, isBlocked: true }).score, 0));
test("negative reply strongly reduces score", () => assert.equal(calculateLeadScore({ ...base, classifications: ["negative_reply"] }).score, 0));
test("needs information is positive intent", () => assert.equal(calculateLeadScore({ ...base, classifications: ["needs_information"], hasVerifiedBusinessEmail: true }).score, 35));
test("meeting request is the highest intent signal", () => assert.ok(calculateLeadScore({ ...base, classifications: ["meeting_request", "interested"], hasVerifiedBusinessEmail: true, hasRecommendedService: true, usefulContactCount: 2, hasOutboundEngagement: true }).score >= 95));
