import assert from "node:assert/strict";
import test from "node:test";
import { classifyLeadReply } from "../../lib/crm/reply-classifier.ts";

for (const phrase of [
  "UNSUBSCRIBE",
  "Please remove my email from your list.",
  "Stop contacting me.",
  "Don't contact me again.",
  "Please take me off your mailing list.",
  "I want to opt out.",
]) {
  test(`explicit opt-out is recognized: ${phrase}`, async () => {
    const result = await classifyLeadReply({ bodyText: phrase });
    assert.equal(result.classification, "unsubscribe");
    assert.equal(result.needsAdminReview, false);
  });
}

test("quoted outbound opt-out footer does not classify a positive reply as unsubscribe", async () => {
  const result = await classifyLeadReply({
    bodyText: "Sounds good. Please send more details.\n\nOn Tue, SocialRUSH wrote:\n> Reply UNSUBSCRIBE to stop emails."
  });
  assert.notEqual(result.classification, "unsubscribe");
});
