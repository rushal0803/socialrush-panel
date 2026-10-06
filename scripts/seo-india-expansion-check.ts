import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  hasUniqueIndiaRegionalClusters,
  hasUniqueIndiaRegionalLocations,
  indiaExpansionPolicy,
  indiaRegionalClusters,
} from "../lib/seo/india-expansion.ts";

const failures: string[] = [];

if (!hasUniqueIndiaRegionalClusters()) {
  failures.push("India regional cluster IDs must be unique.");
}

if (!hasUniqueIndiaRegionalLocations()) {
  failures.push("A city/location appears in more than one Phase 39 regional cluster.");
}

for (const cluster of indiaRegionalClusters) {
  if (cluster.primaryPath !== indiaExpansionPolicy.canonicalRegionalDiscoveryPath) {
    failures.push(`${cluster.id}: regional discovery must resolve to ${indiaExpansionPolicy.canonicalRegionalDiscoveryPath}`);
  }
  if (cluster.locations.length < 2) {
    failures.push(`${cluster.id}: a regional cluster should cover more than one location or justify a standalone page instead.`);
  }
  if (cluster.pageDecision !== "covered-by-national-hub") {
    failures.push(`${cluster.id}: dedicated regional pages are not approved without verified demand and unique content.`);
  }
}

const indiaPage = readFileSync(join(process.cwd(), "app", "social-media-growth-india", "page.tsx"), "utf8");
if (!indiaPage.includes("IndiaRegionalExpansion")) {
  failures.push("The India growth hub must render IndiaRegionalExpansion.");
}
if (!indiaPage.includes("Does SocialRUSH have separate city pricing")) {
  failures.push("The India hub should clarify that regional discovery does not create separate city pricing or local-office claims.");
}

const discovery = readFileSync(join(process.cwd(), "components", "marketing", "IndiaGrowthDiscovery.tsx"), "utf8");
if (!discovery.includes("/social-media-growth-india#india-regional-growth")) {
  failures.push("IndiaGrowthDiscovery must link into the regional discovery section.");
}

const locationRouteTokens = new Set([
  "delhi",
  "gurugram",
  "gurgaon",
  "noida",
  "mumbai",
  "navi-mumbai",
  "pune",
  "bengaluru",
  "bangalore",
  "hyderabad",
  "chennai",
  "coimbatore",
  "kochi",
  "kolkata",
  "bhubaneswar",
  "guwahati",
  "ahmedabad",
  "surat",
  "vadodara",
  "jaipur",
  "jodhpur",
  "udaipur",
  "chandigarh",
  "ludhiana",
  "amritsar",
]);

function walkDirs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return [];
    const full = join(dir, entry.name);
    return [full, ...walkDirs(full)];
  });
}

const appDir = join(process.cwd(), "app");
for (const dir of walkDirs(appDir)) {
  const route = relative(appDir, dir).split(sep).filter((segment) => !segment.startsWith("("));
  const routePath = "/" + route.join("/");
  const tokens = route.flatMap((segment) => segment.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));

  for (const location of locationRouteTokens) {
    const locationTokens = location.split("-");
    const joined = tokens.join("-");
    if (joined.includes(location) || locationTokens.every((token) => tokens.includes(token))) {
      failures.push(
        `Unapproved city/location route detected: ${routePath}. Phase 39 requires verified demand and unique regional content before a dedicated location URL is created.`,
      );
      break;
    }
  }
}

if (failures.length) {
  console.error("Phase 39 India expansion check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `PASS  ${indiaRegionalClusters.length} India regional clusters consolidate discovery on ${indiaExpansionPolicy.canonicalRegionalDiscoveryPath}; no unapproved city doorway routes found.`,
  );
}
