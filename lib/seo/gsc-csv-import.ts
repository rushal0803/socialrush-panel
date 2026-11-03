import { canonicalIndiaServicePaths } from "./canonical-india-services";
import { normalizeRecoveryPath } from "./growth-recovery";

export const gscKinds = ["performance_pages", "indexing_examples"] as const;
export type GscKind = (typeof gscKinds)[number];
export const indexingReasons = [
  "discovered_not_indexed", "crawled_not_indexed", "page_with_redirect",
  "alternate_canonical", "blocked_robots", "duplicate_no_canonical", "other",
] as const;
export type IndexingReason = (typeof indexingReasons)[number];

export type GscObservation = {
  source_path: string;
  canonical_path: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
};

export type ParsedGscCsv = {
  kind: GscKind;
  reason: IndexingReason | null;
  rows: GscObservation[];
};

// Minimal RFC 4180-style parser for Google's downloaded UTF-8 CSV.
// Handles BOM, quoted commas, escaped quotes and CRLF; rejects malformed quotes.
export function splitGscCsv(raw: string): string[][] {
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  if (!raw.trim() || raw.includes("\0")) throw new Error("The CSV is empty or contains invalid characters.");
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, ended = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (quoted) {
      if (c === '"') {
        if (raw[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') {
      if (field.length) throw new Error("Invalid CSV quoting.");
      quoted = true;
    } else if (c === ",") {
      row.push(field.trim()); field = "";
    } else if (c === "\n" || c === "\r") {
      row.push(field.trim()); field = "";
      if (row.some(v => v)) rows.push(row);
      row = [];
      if (c === "\r" && raw[i + 1] === "\n") i++;
      ended = true;
    } else {
      field += c;
      ended = false;
    }
  }
  if (quoted) throw new Error("Unclosed quote in CSV.");
  if (!ended || row.length || field.length) {
    row.push(field.trim());
    if (row.some(v => v)) rows.push(row);
  }
  if (rows.length < 2) throw new Error("The CSV needs a header and at least one data row.");
  return rows;
}

export function parseGscPageUrl(input: string): { source_path: string; canonical_path: string } {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new Error("A row must contain a full SocialRUSH page URL."); }
  if (url.protocol !== "https:" || !["www.getsocialrush.com", "getsocialrush.com"].includes(url.hostname) || url.username || url.password || url.port) {
    throw new Error("Only HTTPS URLs on getsocialrush.com are accepted.");
  }
  // Google page URLs with parameters are not silently aggregated into clean URLs.
  if (url.search || url.hash || /%[0-9a-f]{2}/i.test(url.pathname)) throw new Error("Query strings, fragments and encoded paths require manual review.");
  const source_path = normalizeRecoveryPath(url.pathname);
  const target = (canonicalIndiaServicePaths as Record<string, string>)[source_path.slice(1)] || source_path;
  return { source_path, canonical_path: normalizeRecoveryPath(target) };
}

function getColumn(headers: string[], candidates: string[]): number {
  return headers.findIndex(x => candidates.includes(x));
}
function integerMetric(v: string, name: string): number {
  const cleaned = v.replace(/,/g, "");
  if (!/^\d+$/.test(cleaned)) throw new Error("Invalid " + name + ".");
  const n = Number(cleaned);
  if (!Number.isSafeInteger(n)) throw new Error("Out-of-range " + name + ".");
  return n;
}
function decimalMetric(v: string, name: string): number {
  if (!/^\d+(?:\.\d+)?$/.test(v)) throw new Error("Invalid " + name + ".");
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error("Invalid " + name + ".");
  return n;
}

export function parseGscCsv(input: string, kind: GscKind, reason?: string): ParsedGscCsv {
  if (!gscKinds.includes(kind)) throw new Error("Unsupported GSC export type.");
  const indexingReason = kind === "indexing_examples"
    ? (indexingReasons.includes(reason as IndexingReason) ? reason as IndexingReason : null)
    : null;
  if (kind === "indexing_examples" && !indexingReason) throw new Error("Select the exact Page Indexing exclusion reason before importing.");
  const all = splitGscCsv(input);
  const headers = all[0].map(h => h.toLowerCase().trim().replace(/^\ufeff/, ""));
  const urlColumn = getColumn(headers, ["top pages", "page", "pages", "url", "urls", "landing page"]);
  if (urlColumn < 0) throw new Error("Missing Page/URL column. Export a Pages or Page Indexing Examples CSV.");
  const metricKeys = ["clicks", "impressions", "ctr", "position"];
  const metricCols = metricKeys.map(k => getColumn(headers, [k]));
  if (kind === "performance_pages" && metricCols.some(x => x < 0)) {
    throw new Error("Performance CSV must include Clicks, Impressions, CTR and Position.");
  }
  if (all.length - 1 > 300) throw new Error("Maximum 300 data rows per import. Export a smaller CSV.");
  const rows: GscObservation[] = [];
  const seen = new Set<string>();
  for (let i = 1; i < all.length; i++) {
    const cells = all[i];
    if (cells.length !== headers.length) throw new Error("CSV row " + (i + 1) + " has incorrect column count.");
    let urlInfo: ReturnType<typeof parseGscPageUrl>;
    try { urlInfo = parseGscPageUrl(cells[urlColumn]); }
    catch (e) { throw new Error("CSV row " + (i + 1) + ": " + (e instanceof Error ? e.message : "Invalid URL")); }
    if (seen.has(urlInfo.source_path)) throw new Error("CSV contains the same page more than once: " + urlInfo.source_path);
    seen.add(urlInfo.source_path);
    let clicks: number | null = null, impressions: number | null = null, ctr: number | null = null, position: number | null = null;
    if (kind === "performance_pages") {
      try {
        clicks = integerMetric(cells[metricCols[0]], "clicks");
        impressions = integerMetric(cells[metricCols[1]], "impressions");
        const percent = cells[metricCols[2]];
        if (!percent.endsWith("%")) throw new Error("CTR must use Google's percentage format.");
        ctr = decimalMetric(percent.slice(0, -1).trim(), "CTR") / 100;
        position = decimalMetric(cells[metricCols[3]], "position");
        if (clicks > impressions || ctr > 1 || position < 1) throw new Error("Metrics are inconsistent.");
      } catch (e) { throw new Error("CSV row " + (i + 1) + ": " + (e instanceof Error ? e.message : "Invalid metric")); }
    }
    rows.push({ ...urlInfo, clicks, impressions, ctr, position });
  }
  return { kind, reason: indexingReason, rows };
}

export function parseGscDate(input: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input) || Number.isNaN(Date.parse(input)) || new Date(input).toISOString().slice(0,10) !== input || input > new Date().toISOString().slice(0,10)) {
    throw new Error("Use a valid evidence date that is not in the future.");
  }
  return input;
}
