import assert from "node:assert/strict";
import test from "node:test";
import { validateOrderLink } from "../../lib/order-link-validator.ts";

const facebookContentServices = ["facebook-likes", "facebook-views", "facebook-shares"];

for (const serviceCode of facebookContentServices) {
  test(`${serviceCode} recognizes Facebook post and reel share links`, () => {
    for (const destinationUrl of [
      "https://www.facebook.com/share/r/1CdALhENiT/",
      "https://www.facebook.com/share/p/AbC123/",
      "https://www.facebook.com/share/v/AbC123/",
      "https://www.facebook.com/reel/1234567890",
      "https://www.facebook.com/reels/1234567890",
      "https://www.facebook.com/somepage/posts/1234567890",
    ]) {
      const result = validateOrderLink({ platform: "facebook", serviceCode, destinationUrl });
      assert.equal(result.valid, true, `${serviceCode}: ${destinationUrl} - ${result.message}`);
      assert.equal(result.detectedType, "post or video");
    }
  });

  test(`${serviceCode} rejects page/profile and malformed share links`, () => {
    for (const destinationUrl of [
      "https://www.facebook.com/somepage",
      "https://www.facebook.com/share/r/",
      "https://www.facebook.com/share/r/abc/extra",
      "https://facebook.com.evil.example/share/r/abc",
    ]) {
      assert.equal(validateOrderLink({ platform: "facebook", serviceCode, destinationUrl }).valid, false, destinationUrl);
    }
  });
}

test("Facebook followers must not accept a reel share URL", () => {
  const result = validateOrderLink({ platform: "facebook", serviceCode: "facebook-followers", destinationUrl: "https://www.facebook.com/share/r/1CdALhENiT/" });
  assert.equal(result.valid, false);
});

// The same validator is used by the checkout intent API for Facebook services.
test("Facebook content URLs have consistent checkout validation", () => {
  for (const serviceCode of facebookContentServices) {
    const reel = validateOrderLink({ platform: "facebook", serviceCode, destinationUrl: "https://www.facebook.com/share/r/1CdALhENiT/" });
    const profile = validateOrderLink({ platform: "facebook", serviceCode, destinationUrl: "https://www.facebook.com/examplepage" });
    assert.equal(reel.valid, true);
    assert.equal(profile.valid, false);
  }
});
