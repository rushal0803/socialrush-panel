import { pathToFileURL } from "node:url";

export const INDEXNOW_KEY = "8f7d2c91a4e64b7f9c3d1a6e5b8f2047";
export const INDEXNOW_HOST = "www.getsocialrush.com";
export const INDEXNOW_KEY_PATH = "/8f7d2c91a4e64b7f9c3d1a6e5b8f2047.txt";

export const phase5IndexNowPaths = [
  "/",
  "/services",
  "/pricing",
  "/blog",
  "/tools",
  "/tools/social-media-service-cost-calculator",
  "/instagram-growth-india",
  "/youtube-growth-india",
  "/facebook-growth-india",
  "/linkedin-growth-india",
  "/x-growth-india",
  "/tiktok-growth-india",
  "/buy-instagram-followers-india",
  "/instagram-likes",
  "/instagram-views",
  "/youtube-subscribers",
  "/youtube-likes",
  "/youtube-views",
  "/linkedin-followers",
  "/linkedin-likes",
  "/twitter-followers",
  "/buy-facebook-followers-india",
  "/facebook-likes",
  "/facebook-views",
  "/telegram-members",
  "/tiktok-followers",
  "/blog/youtube-subscribers-price-in-india",
  "/blog/linkedin-followers-price-in-india",
  "/blog/facebook-followers-price-in-india",
  "/blog/twitter-followers-price-in-india",
  "/blog/telegram-members-price-in-india",
  "/blog/is-it-safe-to-buy-youtube-subscribers",
  "/blog/is-it-safe-to-buy-youtube-views",
  "/blog/is-it-safe-to-buy-linkedin-followers",
  "/blog/is-it-safe-to-buy-twitter-followers",
  "/blog/is-it-safe-to-buy-telegram-members",
];

const baseUrl = `https://${INDEXNOW_HOST}`;
const keyLocation = `${baseUrl}${INDEXNOW_KEY_PATH}`;

async function waitForKeyFile() {
  const attempts = Number(process.env.INDEXNOW_KEY_CHECK_ATTEMPTS || 30);
  const delayMs = Number(process.env.INDEXNOW_KEY_CHECK_DELAY_MS || 10_000);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(keyLocation, { cache: "no-store" });
      const body = (await response.text()).trim();
      if (response.ok && body === INDEXNOW_KEY) return;
    } catch {
      // Production may still be switching to the new deployment.
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`IndexNow key file is not live at ${keyLocation}`);
}

export async function submitPhase5IndexNowRelease() {
  await waitForKeyFile();

  const urlList = phase5IndexNowPaths.map((path) => new URL(path, baseUrl).toString());
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList,
    }),
  });

  if (![200, 202].includes(response.status)) {
    const body = await response.text();
    throw new Error(`IndexNow submission failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  console.log(`IndexNow accepted ${urlList.length} Phase 5 URLs with HTTP ${response.status}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await submitPhase5IndexNowRelease();
}
