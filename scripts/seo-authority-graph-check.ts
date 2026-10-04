import {
  buildInternalAuthoritySnapshot,
  getMoneyPageAuthorityTargets,
  organicAuthorityExcludedPaths,
} from "../lib/seo/authority-graph.ts";
import { contentClusters, type ContentPlatform } from "../lib/seo/content-clusters.ts";
import { isCommercialAliasPath } from "../lib/seo/query-ownership.ts";

const failures: string[] = [];
const snapshot = buildInternalAuthoritySnapshot();
const excluded = new Set<string>(organicAuthorityExcludedPaths);

if (snapshot.orphanServices.length) {
  failures.push(`orphan service nodes: ${snapshot.orphanServices.map((node) => node.path).join(", ")}`);
}

for (const edge of snapshot.edges) {
  if (edge.from === edge.to) failures.push(`self-link edge: ${edge.from}`);
  if (isCommercialAliasPath(edge.from) || isCommercialAliasPath(edge.to)) {
    failures.push(`commercial alias leaked into authority graph: ${edge.from} -> ${edge.to}`);
  }
  if (excluded.has(edge.from) || excluded.has(edge.to)) {
    failures.push(`noindex catalog path leaked into authority graph: ${edge.from} -> ${edge.to}`);
  }
}

for (const [platform, cluster] of Object.entries(contentClusters) as Array<[ContentPlatform, (typeof contentClusters)[ContentPlatform]]>) {
  const targets = getMoneyPageAuthorityTargets(platform);
  const hrefs = new Set(targets.map((target) => target.href));

  if (!hrefs.has(cluster.hubPath)) failures.push(`${platform}: money-page graph is missing hub ${cluster.hubPath}`);
  for (const service of cluster.serviceLinks) {
    if (!hrefs.has(service.href)) failures.push(`${platform}: money-page graph is missing canonical service ${service.href}`);
  }
}

if (snapshot.summary.internationalNodes === 0) {
  failures.push("international authority nodes are missing");
}

if (failures.length) {
  console.error("Phase 29 internal authority graph check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `PASS  ${snapshot.summary.nodes} nodes, ${snapshot.summary.edges} edges, ${snapshot.summary.serviceNodes} money pages, ${snapshot.summary.internationalNodes} international nodes, 0 orphan services.`,
  );
}
