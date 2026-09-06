import test from "node:test";
import assert from "node:assert/strict";
import { relatedServices } from "../../lib/cro/related-services.ts";

const catalog: any[] = [
  { code: "instagram-followers", platform: "instagram", isActive: true },
  { code: "instagram-likes", platform: "instagram", isActive: true },
  { code: "instagram-views", platform: "instagram", isActive: false },
  { code: "instagram-comments", platform: "instagram", isActive: true },
];
test("related services are mapped, active, unique, bounded, and exclude their source", () => {
  const result = relatedServices("instagram-followers", catalog as any, 2);
  assert.deepEqual(result.map((item) => item.code), ["instagram-likes", "instagram-comments"]);
  assert.equal(result.some((item) => item.code === "instagram-followers"), false);
  assert.equal(relatedServices("unknown", catalog as any).length, 0);
});
