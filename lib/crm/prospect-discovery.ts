import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeDomain } from "@/lib/crm/prospecting";
import { companySeedFromResult, normalizeCompanyName, resolveOfficialWebsite, selectCompanySeeds } from "@/lib/crm/prospect-discovery-resolver";
import { enrichOfficialBusinessWebsite } from "@/lib/crm/prospect-enrichment";

type DiscoveryTrigger = "cron" | "manual";
type BraveResult = { title?: string; url?: string; description?: string };
type SearchItem = { country: string; countryName: string; segment: string; query: string };
const COUNTRY_NAMES: Record<string, string> = { IN: "India" };
export const MAX_RESOLUTIONS_PER_RUN = 6;
export const MAX_BACKLOG_ENRICHMENTS_PER_RUN = 5;
export const MINIMUM_SEED_FIT_SCORE = 50;
function companyTypeForSegment(segment: string) { if (segment.includes("agency")) return "marketing agency"; if (segment.includes("e-commerce")) return "e-commerce business"; if (segment.includes("creator")) return "creator business"; if (segment.includes("professional")) return "professional services business"; return segment.includes("startup") ? "startup" : "small business"; }
export function seedQueryForSegment(segment: string, countryName: string) { return ({ "marketing agency": `${countryName} digital marketing agency official website`, "e-commerce brand": `${countryName} D2C ecommerce brand official website`, startup: `${countryName} SaaS startup official website`, "creator business": `${countryName} creator influencer marketing agency official website`, "professional services": `${countryName} consulting firm official website` }[segment.toLowerCase()] || `${countryName} ${segment} official website`); }
export const officialSiteQuery = (companyName: string, countryName: string) => `"${companyName}" ${countryName} official website`;
function buildSeedItem(countries: string[], segments: string[]) { const safeCountries = countries.length ? countries : ["IN"]; const safeSegments = segments.length ? segments : ["marketing agency", "e-commerce brand", "startup", "creator business", "professional services"]; const index = Math.floor(Date.now() / 86_400_000); const country = safeCountries[index % safeCountries.length]; const segment = safeSegments[index % safeSegments.length]; const countryName = COUNTRY_NAMES[country] || country; return { country, countryName, segment, query: seedQueryForSegment(segment, countryName) }; }
function istDayBounds(now = new Date()) { const offset = 5.5 * 3_600_000, ist = new Date(now.getTime() + offset), startMs = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - offset; return { start: new Date(startMs).toISOString(), end: new Date(startMs + 86_400_000).toISOString() }; }
async function braveSearch(apiKey: string, item: SearchItem, count: number) { const params = new URLSearchParams({ q: item.query, country: item.country, search_lang: "en", count: String(Math.min(20, Math.max(1, count))), safesearch: "strict" }); const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12_000); try { const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, { headers: { Accept: "application/json", "X-Subscription-Token": apiKey }, cache: "no-store", signal: controller.signal }); if (!response.ok) throw new Error(`Brave Search returned ${response.status}: ${(await response.text()).slice(0, 180)}`); return (((await response.json()) as { web?: { results?: BraveResult[] } }).web?.results || []); } finally { clearTimeout(timeout); } }
const sourceExternalId = (domain: string) => createHash("sha256").update(domain).digest("hex");

async function enrichCandidate(
  db: ReturnType<typeof createAdminClient>,
  candidate: { id: string; website_url: string | null; domain: string | null },
  createdBy: string | null,
) {
  if (!candidate.website_url || !candidate.domain) return { enriched: false, verifiedEmail: false };
  const enrichment = await enrichOfficialBusinessWebsite(candidate.website_url, candidate.domain);
  const hasSignal = Boolean(
    enrichment.businessEmail
    || enrichment.instagramUrl
    || enrichment.linkedinUrl
    || enrichment.youtubeUrl
    || enrichment.tiktokUrl,
  );
  const patch = {
    business_email: enrichment.businessEmail,
    email_type: enrichment.businessEmail ? "business" : "unknown",
    email_verification_status: enrichment.businessEmail
      ? (enrichment.emailVerified ? "valid" : "risky")
      : "unverified",
    compliance_status: enrichment.businessEmail && enrichment.emailVerified ? "eligible" : "review",
    instagram_url: enrichment.instagramUrl,
    linkedin_url: enrichment.linkedinUrl,
    youtube_url: enrichment.youtubeUrl,
    tiktok_url: enrichment.tiktokUrl,
    source_url: enrichment.emailSourceUrl || candidate.website_url,
    research_status: "complete",
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("crm_lead_candidates").update(patch).eq("id", candidate.id);
  if (error) throw error;
  await db.from("crm_candidate_activities").insert({
    candidate_id: candidate.id,
    activity_type: "rescored",
    details: {
      automation: "official_site_enrichment",
      public_business_email_found: Boolean(enrichment.businessEmail),
      email_domain_mx_valid: enrichment.emailVerified,
      social_profiles_found: [
        enrichment.instagramUrl && "instagram",
        enrichment.linkedinUrl && "linkedin",
        enrichment.youtubeUrl && "youtube",
        enrichment.tiktokUrl && "tiktok",
      ].filter(Boolean),
    },
    created_by: createdBy,
  });
  return { enriched: hasSignal, verifiedEmail: Boolean(enrichment.businessEmail && enrichment.emailVerified) };
}

export async function runProspectDiscovery({ trigger, createdBy = null }: { trigger: DiscoveryTrigger; createdBy?: string | null }) {
  const db = createAdminClient(); const { data: settings, error: settingsError } = await db.from("crm_prospect_discovery_settings").select("*").eq("id", true).single(); if (settingsError || !settings) throw new Error(settingsError?.message || "Prospect discovery settings are unavailable.");
  const { data: run, error: runError } = await db.from("crm_prospect_discovery_runs").insert({ provider: settings.provider || "brave", trigger, status: "running", created_by: createdBy }).select("id").single(); if (runError || !run) throw new Error(runError?.message || "Could not create prospect discovery run.");
  const finish = (values: Record<string, unknown>) => db.from("crm_prospect_discovery_runs").update({ ...values, finished_at: new Date().toISOString() }).eq("id", run.id);
  if (!settings.enabled) { await finish({ status: "skipped", error_message: "Discovery is disabled." }); return { runId: run.id, status: "skipped", reason: "Discovery is disabled." }; }
  if (settings.provider !== "brave") { await finish({ status: "failed", error_count: 1, error_message: `Unsupported discovery provider: ${settings.provider}` }); throw new Error(`Unsupported discovery provider: ${settings.provider}`); }
  const apiKey = process.env.BRAVE_SEARCH_API_KEY?.trim(); if (!apiKey) { await finish({ status: "skipped", error_message: "BRAVE_SEARCH_API_KEY is not configured." }); return { runId: run.id, status: "skipped", reason: "BRAVE_SEARCH_API_KEY is not configured." }; }
  const bounds = istDayBounds(), { data: previous = [] } = await db.from("crm_prospect_discovery_runs").select("id,search_count,status").gte("started_at", bounds.start).lt("started_at", bounds.end).neq("id", run.id).in("status", ["running", "completed", "partial", "failed"]), used = previous.reduce((total, row) => total + Number(row.search_count || 0), 0), dailyLimit = Math.max(1, Number(settings.daily_search_limit || 4)), remaining = Math.max(0, dailyLimit - used);
  if (!remaining) { await finish({ status: "skipped", metadata: { reason: "daily_limit_reached", daily_limit: dailyLimit, already_used: used } }); return { runId: run.id, status: "skipped", reason: "Daily discovery limit reached." }; }
  const seed = buildSeedItem(settings.target_countries || [], settings.segment_rotation || []); let searchCount = 0, discoveredCount = 0, stagedCount = 0, duplicateCount = 0, invalidCount = 0, errorCount = 0; let firstError: string | null = null;
  const audit: { [key: string]: unknown; resolutions: Array<Record<string, unknown>> } = { daily_limit: dailyLimit, previously_used_today: used, seed_query: seed.query, seed_results_discovered: 0, names_extracted: 0, seed_names_rejected_before_resolution: 0, ranked_company_seeds: [], names_considered_for_resolution: 0, official_sites_resolved: 0, backlog_enriched: 0, verified_business_emails_found: 0, promoted_count: 0, rejected_or_skipped: 0, total_brave_request_count: 0, resolutions: [] };
  const [candidateDomains, leadDomains] = await Promise.all([db.from("crm_lead_candidates").select("domain"), db.from("crm_leads").select("domain")]); const known = new Set<string>(); for (const row of [...(candidateDomains.data || []), ...(leadDomains.data || [])]) { const domain = normalizeDomain(row.domain); if (domain) known.add(domain); }

  const { data: backlogCandidates = [], error: backlogError } = await db
    .from("crm_lead_candidates")
    .select("id,website_url,domain")
    .eq("source", "brave_web")
    .is("promoted_lead_id", null)
    .in("qualification_status", ["new", "researching", "qualified", "ready"])
    .in("research_status", ["new", "needed", "researching"])
    .not("website_url", "is", null)
    .order("discovered_at", { ascending: false })
    .limit(MAX_BACKLOG_ENRICHMENTS_PER_RUN);
  if (backlogError) { errorCount++; firstError ||= `Backlog enrichment lookup failed: ${backlogError.message}`; }
  for (const candidate of backlogCandidates || []) {
    try {
      const result = await enrichCandidate(db, candidate, createdBy);
      if (result.enriched) audit.backlog_enriched = Number(audit.backlog_enriched) + 1;
      if (result.verifiedEmail) audit.verified_business_emails_found = Number(audit.verified_business_emails_found) + 1;
    } catch (error) {
      errorCount++;
      firstError ||= error instanceof Error ? error.message : "Candidate enrichment failed.";
    }
  }
  try {
    searchCount++; const seedResults = await braveSearch(apiKey, seed, Number(settings.results_per_search || 10)); discoveredCount = seedResults.length; audit.seed_results_discovered = seedResults.length;
    const names = new Map<string, NonNullable<ReturnType<typeof companySeedFromResult>>>(); for (const result of seedResults) { const company = companySeedFromResult(result); if (!company) { invalidCount++; continue; } names.set(normalizeCompanyName(company.companyName), company); }
    audit.names_extracted = names.size; const ranked = selectCompanySeeds([...names.values()], seed.segment, Math.min(MAX_RESOLUTIONS_PER_RUN, Math.max(0, remaining - 1)), MINIMUM_SEED_FIT_SCORE); const selected = ranked.filter((company) => company.selectedForResolution); audit.ranked_company_seeds = ranked.map(({ companyName, seedFitScore, seedFitReasons, seedRejectedReason, selectedForResolution }) => ({ company_name: companyName, seedFitScore, seedFitReasons, seedRejectedReason: seedRejectedReason || null, selected_for_resolution: selectedForResolution })); audit.seed_names_rejected_before_resolution = ranked.filter((company) => company.seedRejectedReason || company.seedFitScore < MINIMUM_SEED_FIT_SCORE).length; invalidCount += Number(audit.seed_names_rejected_before_resolution); audit.names_considered_for_resolution = selected.length;
    for (const company of selected) { const query = officialSiteQuery(company.companyName, seed.countryName), resolutionItem = { ...seed, query }; searchCount++; try { const results = await braveSearch(apiKey, resolutionItem, Number(settings.results_per_search || 10)); const hit = results.map((result) => ({ result, resolution: resolveOfficialWebsite(company.companyName, result) })).find((item) => item.resolution);
      if (!hit?.resolution) { invalidCount++; audit.resolutions.push({ company_name: company.companyName, seed_result_title: company.title, seed_result_url: company.url, resolution_query: query, skipped_reason: "no_high_confidence_official_site" }); continue; }
      const { website, score, reasons } = hit.resolution; audit.official_sites_resolved = Number(audit.official_sites_resolved) + 1; if (known.has(website.domain)) { duplicateCount++; audit.resolutions.push({ company_name: company.companyName, resolution_query: query, selected_official_url: website.websiteUrl, resolver_confidence_score: score, confidence_reasons: reasons, skipped_reason: "known_domain_duplicate" }); continue; }
      const { data: candidate, error } = await db.from("crm_lead_candidates").insert({ business_name: company.companyName, domain: website.domain, website_url: website.websiteUrl, country: seed.countryName, company_type: companyTypeForSegment(seed.segment), business_email: null, email_type: "unknown", email_verification_status: "unverified", source: "brave_web", source_name: "Brave Search automated discovery", source_external_id: sourceExternalId(website.domain), source_url: website.websiteUrl, research_status: "new", qualification_status: "new", compliance_status: "review", research_notes: hit.result.description?.replace(/\s+/g, " ").trim().slice(0, 500) || null, created_by: createdBy }).select("id").single();
      if (error || !candidate) { if (error?.code === "23505") { duplicateCount++; known.add(website.domain); } else { errorCount++; firstError ||= error?.message || "Candidate insert failed."; } continue; }
      stagedCount++; known.add(website.domain);
      await db.from("crm_candidate_activities").insert({ candidate_id: candidate.id, activity_type: "imported", details: { source: "Brave Search automated discovery", discovery_run_id: run.id, seed_query: seed.query, seed_result_title: company.title, seed_result_url: company.url, extracted_company_name: company.companyName, resolution_query: query, selected_official_url: website.websiteUrl, resolver_confidence_score: score, confidence_reasons: reasons, target_country: seed.countryName, segment: seed.segment }, created_by: createdBy });
      try {
        const enrichment = await enrichCandidate(db, { id: candidate.id, website_url: website.websiteUrl, domain: website.domain }, createdBy);
        if (enrichment.enriched) audit.backlog_enriched = Number(audit.backlog_enriched) + 1;
        if (enrichment.verifiedEmail) audit.verified_business_emails_found = Number(audit.verified_business_emails_found) + 1;
      } catch (enrichmentError) {
        errorCount++;
        firstError ||= enrichmentError instanceof Error ? enrichmentError.message : "New candidate enrichment failed.";
      }
      audit.resolutions.push({ company_name: company.companyName, resolution_query: query, selected_official_url: website.websiteUrl, resolver_confidence_score: score, confidence_reasons: reasons, staged: true });
    } catch (error) { errorCount++; firstError ||= error instanceof Error ? error.message : "Unknown resolution error."; } }
  } catch (error) { errorCount++; firstError ||= error instanceof Error ? error.message : "Unknown seed discovery error."; }
  audit.rejected_or_skipped = invalidCount; audit.total_brave_request_count = searchCount;
  const { data: promoted, error: pipelineError } = await db.rpc("refresh_crm_prospecting_pipeline");
  if (pipelineError) { errorCount++; firstError ||= `Prospecting pipeline refresh failed: ${pipelineError.message}`; }
  audit.promoted_count = Number(promoted || 0);
  const status = errorCount === 0 ? "completed" : searchCount ? "partial" : "failed";
  await finish({ status, search_count: searchCount, discovered_count: discoveredCount, staged_count: stagedCount, duplicate_count: duplicateCount, invalid_count: invalidCount, error_count: errorCount, error_message: firstError, metadata: audit });
  return { runId: run.id, status, searches: searchCount, results: discoveredCount, staged: stagedCount, promoted: Number(promoted || 0), duplicates: duplicateCount, invalid: invalidCount, errors: errorCount };
}
