import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const instagramFollowersPage = new URL("../../app/buy-instagram-followers-india/page.tsx", import.meta.url);

test("Instagram followers India page does not imply India-based delivery", async () => {
  const source = await readFile(instagramFollowersPage, "utf8");

  assert.equal(source.includes('"Indian Audience"'), false);
  assert.equal(source.includes("Indian audience option"), false);
  assert.match(source, /INR Pricing/);
  assert.match(source, /India pricing does not by itself mean every delivered account is India-based/);
});
