#!/usr/bin/env node

const BASE_URL = process.env.AEO_BASE_URL || "https://www.getsocialrush.com";
const TIMEOUT_MS = 20_000;
const failures = [];

const serviceTargets = [
  "/buy-instagram-followers-india",
  "/youtube-subscribers",
  "/linkedin-followers",
  "/twitter-followers",
  "/buy-facebook-followers-india",
  "/telegram-members",
];

async function fetchText(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(new URL(path, BASE_URL), {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "SocialRUSH-Phase48-AEO-Audit/1.0" },
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

console.log(`SocialRUSH Phase 48 AEO audit: ${BASE_URL}`);

const robots = await fetchText("/robots.txt");
expect(robots.response.status === 200, `robots.txt returned ${robots.response.status}`);
const oaiGroup = robots.text.match(/User-agent:\s*OAI-SearchBot([\s\S]*?)(?=\nUser-agent:|\nSitemap:|$)/i)?.[1] ?? "";
expect(Boolean(oaiGroup), "robots.txt does not define an explicit OAI-SearchBot group");
expect(/Allow:\s*\//i.test(oaiGroup), "OAI-SearchBot is not explicitly allowed on public paths");
for (const path of ["/dashboard", "/admin", "/api/"]) {
  expect(oaiGroup.includes(`Disallow: ${path}`), `OAI-SearchBot group does not protect ${path}`);
}

const home = await fetchText("/");
expect(home.response.status === 200, `homepage returned ${home.response.status}`);
expect(home.text.includes("/#organization"), "homepage is missing the canonical Organization entity id");
expect(home.text.includes("/#website"), "homepage is missing the canonical WebSite entity id");

for (const path of serviceTargets) {
  const { response, text } = await fetchText(path);
  expect(response.status === 200, `${path} returned ${response.status}`);
  expect(text.includes('data-aeo-answer="service-summary"'), `${path} is missing the answer-ready service summary`);
  expect(text.includes("/#organization"), `${path} does not link structured data to the canonical organization entity`);
  expect(text.includes('"@type":"Service"') || text.includes('&quot;@type&quot;:&quot;Service&quot;'), `${path} is missing Service structured data`);
}

const article = await fetchText("/blog/youtube-subscribers-price-in-india");
expect(article.response.status === 200, `AEO sample article returned ${article.response.status}`);
expect(article.text.includes('"@type":"BlogPosting"') || article.text.includes('&quot;@type&quot;:&quot;BlogPosting&quot;'), "sample article is missing BlogPosting structured data");
expect(article.text.includes("/#organization"), "sample article is not linked to the canonical organization entity");

if (failures.length) {
  console.error("\nPhase 48 AEO audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`PASS  OAI-SearchBot access, entity graph and ${serviceTargets.length} core answer-ready service pages verified.`);
}
