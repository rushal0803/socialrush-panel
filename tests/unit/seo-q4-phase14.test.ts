import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const members = readFileSync(new URL("../../components/marketing/TelegramFollowersLanding.tsx", import.meta.url), "utf8");
const hub = readFileSync(new URL("../../app/services/telegram/page.tsx", import.meta.url), "utf8");

test("Telegram Members explains members vs views vs reactions", () => {
  assert.match(members, /Telegram Members vs Post Views vs Reactions/);
  assert.match(members, /href="\/services\/telegram-post-views"/);
  assert.match(members, /href="\/services\/telegram-post-reactions"/);
  assert.match(members, /href="\/services\/telegram"/);
});

test("Telegram catalog hub links all existing Telegram service choices", () => {
  assert.match(hub, /href="\/telegram-members"/);
  assert.match(hub, /href="\/services\/telegram-post-views"/);
  assert.match(hub, /href="\/services\/telegram-post-reactions"/);
  assert.match(hub, /href="\/services\/telegram-poll-votes"/);
  assert.match(hub, /Members, post views, reactions, or poll votes\?/);
});

test("Phase 14 preserves the existing Telegram Members order flow", () => {
  assert.match(members, /TelegramFollowersLanding/);
  assert.match(members, /\/dashboard\/new-order\?platform=telegram&service=telegram-members/);
  assert.match(members, /IndiaSearchDemandSection serviceCode="telegram-members"/);
  assert.doesNotMatch(members, /href="\/buy-telegram-post-views/);
  assert.doesNotMatch(members, /href="\/buy-telegram-post-reactions/);
});
