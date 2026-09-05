import "server-only";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeDomain } from "@/lib/crm/prospecting";
import { isLowQualityDiscoveryResult } from "@/lib/crm/prospect-discovery-filters";

type DiscoveryTrigger = "cron" | "manual";

type BraveResult = {
  title?: string;
  url?: string;
  description?: string;
};

type SearchPlanItem = {
  country: string;
  countryName: string;
  segment: string;
  query: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
};

const BLOCKED_DOMAINS = [
  // Social networks — useful later for research, not as the company website.
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "pinterest.com",

  // Directories / prospect databases / review sites.
  "clutch.co",
  "designrush.com",
  "goodfirms.co",
  "yelp.com",
  "yellowpages.com",
  "crunchbase.com",
  "zoominfo.com",
  "apollo.io",
  "rocketreach.co",
  "signalhire.com",
  "companydatabase.in",
  "scribd.com",
  "golden.com",
  "ibef.org",
  "builtin.com",
  "vcsdata.com",
  "justdial.com",
  "indiamart.com",
  "sulekha.com",
  "tradeindia.com",
  "zaubacorp.com",
  "thecompanycheck.com",
  "kompass.com",
  "dnb.com",

  // Jobs.
  "indeed.com",
  "glassdoor.com",
  "ziprecruiter.com",

  // General content/community sites.
  "wikipedia.org",
  "reddit.com",
  "medium.com",
  "substack.com",
  "github.com",
  "quora.com",

  // Search engines.
  "google.com",
  "bing.com",
  "yahoo.com",
  "brave.com",
];

function isBlockedDomain(domain: string) {
  return BLOCKED_DOMAINS.some(
    (blocked) =>
      domain === blocked ||
      domain.endsWith(`.${blocked}`),
  );
}

function companyTypeForSegment(segment: string) {
  const value = segment.toLowerCase();

  if (value.includes("agency")) {
    return "marketing agency";
  }

  if (value.includes("e-commerce") || value.includes("ecommerce")) {
    return "e-commerce business";
  }

  if (value.includes("creator")) {
    return "creator business";
  }

  if (value.includes("professional")) {
    return "professional services business";
  }

  if (value.includes("startup")) {
    return "startup";
  }

  return "small business";
}

function domainBusinessName(domain: string) {
  const first = domain.split(".")[0] || domain;

  return first
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function cleanBusinessName(
  title: string | undefined,
  domain: string,
) {
  if (!title) {
    return domainBusinessName(domain);
  }

  const cleaned = title
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const pieces = cleaned
    .split(/\s(?:\||—|–|-)\s/)
    .map((item) => item.trim())
    .filter(Boolean);

  const candidate = pieces[0] || cleaned;

  const looksLikeArticle =
    /^(top\s+\d+|top\b|best\b|list of\b|directory\b|compare\b|find\b)/i.test(
      candidate,
    );

  if (
    looksLikeArticle ||
    candidate.length < 2 ||
    candidate.length > 80
  ) {
    return domainBusinessName(domain);
  }

  return candidate;
}

function getWebsite(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.protocol !== "https:" &&
      parsed.protocol !== "http:"
    ) {
      return null;
    }

    const domain = normalizeDomain(parsed.hostname);

    if (!domain || isBlockedDomain(domain)) {
      return null;
    }

    if (
      domain.endsWith(".gov") ||
      domain.endsWith(".gov.au") ||
      domain.endsWith(".edu") ||
      domain.endsWith(".gov.in") ||
      domain.endsWith(".nic.in") ||
      domain.endsWith(".ac.in") ||
      domain.endsWith(".edu.in")
    ) {
      return null;
    }

    if (
      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(
        parsed.pathname,
      )
    ) {
      return null;
    }

    return {
      domain,
      websiteUrl: `${parsed.protocol}//${parsed.hostname}`,
    };
  } catch {
    return null;
  }
}

function istDayBounds(now = new Date()) {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;

  const ist = new Date(now.getTime() + istOffsetMs);

  const startUtc =
    Date.UTC(
      ist.getUTCFullYear(),
      ist.getUTCMonth(),
      ist.getUTCDate(),
      0,
      0,
      0,
      0,
    ) - istOffsetMs;

  const endUtc = startUtc + 24 * 60 * 60 * 1000;

  return {
    start: new Date(startUtc).toISOString(),
    end: new Date(endUtc).toISOString(),
  };
}

function buildSearchPlan(
  countries: string[],
  segments: string[],
  limit: number,
) {
 const safeCountries =
  countries.length > 0
    ? countries
    : ["IN"];

  const safeSegments =
    segments.length > 0
      ? segments
      : [
          "marketing agency",
          "e-commerce brand",
          "startup",
          "creator business",
          "professional services",
        ];

  const dayNumber = Math.floor(
    Date.now() / 86_400_000,
  );

  const plan: SearchPlanItem[] = [];

  for (let i = 0; i < limit; i += 1) {
    const country =
      safeCountries[
        (dayNumber + i) % safeCountries.length
      ];

    const segment =
      safeSegments[
        (dayNumber + i) % safeSegments.length
      ];

    const countryName =
      COUNTRY_NAMES[country] || country;

    plan.push({
      country,
      countryName,
      segment,
      query: ({
        "marketing agency": `"digital marketing agency" ${countryName} "contact us" official website`,
        "e-commerce brand": `"D2C brand" ${countryName} "official store"`,
        startup: `"${countryName} startup" founder "official website"`,
        "creator business": `"creator agency" ${countryName} "official website"`,
        "professional services": `"consulting firm" ${countryName} "official website"`,
      }[segment.toLowerCase()] || `${segment} ${countryName} company official website`),
    });
  }

  return plan;
}

async function braveSearch(
  apiKey: string,
  item: SearchPlanItem,
  count: number,
) {
  const params = new URLSearchParams({
    q: item.query,
    country: item.country,
    search_lang: "en",
    count: String(Math.min(20, Math.max(1, count))),
    safesearch: "strict",
  });

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    12_000,
  );

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        `Brave Search returned ${response.status}: ${text.slice(
          0,
          180,
        )}`,
      );
    }

    const payload = (await response.json()) as {
      web?: {
        results?: BraveResult[];
      };
    };

    return payload.web?.results || [];
  } finally {
    clearTimeout(timeout);
  }
}

function sourceExternalId(domain: string) {
  return createHash("sha256")
    .update(domain)
    .digest("hex");
}

export async function runProspectDiscovery({
  trigger,
  createdBy = null,
}: {
  trigger: DiscoveryTrigger;
  createdBy?: string | null;
}) {
  const db = createAdminClient();

  const {
    data: settings,
    error: settingsError,
  } = await db
    .from("crm_prospect_discovery_settings")
    .select("*")
    .eq("id", true)
    .single();

  if (settingsError || !settings) {
    throw new Error(
      settingsError?.message ||
        "Prospect discovery settings are unavailable.",
    );
  }

  const {
    data: run,
    error: runError,
  } = await db
    .from("crm_prospect_discovery_runs")
    .insert({
      provider: settings.provider || "brave",
      trigger,
      status: "running",
      created_by: createdBy,
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(
      runError?.message ||
        "Could not create prospect discovery run.",
    );
  }

  const finishRun = async (
    values: Record<string, unknown>,
  ) => {
    await db
      .from("crm_prospect_discovery_runs")
      .update({
        ...values,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);
  };

  if (!settings.enabled) {
    await finishRun({
      status: "skipped",
      error_message: "Discovery is disabled.",
    });

    return {
      runId: run.id,
      status: "skipped",
      reason: "Discovery is disabled.",
    };
  }

  if (settings.provider !== "brave") {
    await finishRun({
      status: "failed",
      error_count: 1,
      error_message: `Unsupported discovery provider: ${settings.provider}`,
    });

    throw new Error(
      `Unsupported discovery provider: ${settings.provider}`,
    );
  }

  const apiKey =
    process.env.BRAVE_SEARCH_API_KEY?.trim();

  if (!apiKey) {
    await finishRun({
      status: "skipped",
      error_message:
        "BRAVE_SEARCH_API_KEY is not configured.",
    });

    return {
      runId: run.id,
      status: "skipped",
      reason:
        "BRAVE_SEARCH_API_KEY is not configured.",
    };
  }

  /*
   * Daily API-budget protection.
   *
   * The limit is shared between cron + manual runs,
   * based on the Asia/Kolkata calendar day.
   */
  const bounds = istDayBounds();

  const { data: previousRuns = [] } = await db
    .from("crm_prospect_discovery_runs")
    .select("id,search_count,status")
    .gte("started_at", bounds.start)
    .lt("started_at", bounds.end)
    .neq("id", run.id)
    .in("status", [
      "running",
      "completed",
      "partial",
      "failed",
    ]);

  const alreadyUsed = previousRuns.reduce(
    (total, previous) =>
      total +
      Number(previous.search_count || 0),
    0,
  );

  const dailyLimit = Math.max(
    1,
    Number(settings.daily_search_limit || 4),
  );

  const remainingSearches = Math.max(
    0,
    dailyLimit - alreadyUsed,
  );

  if (remainingSearches <= 0) {
    await finishRun({
      status: "skipped",
      metadata: {
        reason: "daily_limit_reached",
        daily_limit: dailyLimit,
        already_used: alreadyUsed,
      },
    });

    return {
      runId: run.id,
      status: "skipped",
      reason: "Daily discovery limit reached.",
    };
  }

  const plan = buildSearchPlan(
    settings.target_countries || [],
    settings.segment_rotation || [],
    remainingSearches,
  );

  /*
   * Load known domains once.
   * Phase 2 will still perform its own authoritative
   * duplicate checks after staging.
   */
  const [
    candidateDomainResult,
    leadDomainResult,
  ] = await Promise.all([
    db
      .from("crm_lead_candidates")
      .select("domain"),
    db.from("crm_leads").select("domain"),
  ]);

  const knownDomains = new Set<string>();

  for (const row of candidateDomainResult.data || []) {
    const normalized = normalizeDomain(row.domain);

    if (normalized) {
      knownDomains.add(normalized);
    }
  }

  for (const row of leadDomainResult.data || []) {
    const normalized = normalizeDomain(row.domain);

    if (normalized) {
      knownDomains.add(normalized);
    }
  }

  let searchCount = 0;
  let discoveredCount = 0;
  let stagedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  let errorCount = 0;

  let firstError: string | null = null;

  const executedQueries: Array<{
    query: string;
    country: string;
    segment: string;
    result_count: number;
  }> = [];

  for (const item of plan) {
    searchCount += 1;

    try {
      const results = await braveSearch(
        apiKey,
        item,
        Number(settings.results_per_search || 10),
      );

      discoveredCount += results.length;

      executedQueries.push({
        query: item.query,
        country: item.country,
        segment: item.segment,
        result_count: results.length,
      });

      for (const result of results) {
        if (!result.url) {
          invalidCount += 1;
          continue;
        }

        const website = getWebsite(result.url);

        if (!website || isLowQualityDiscoveryResult(result)) {
          invalidCount += 1;
          continue;
        }

        if (knownDomains.has(website.domain)) {
          duplicateCount += 1;
          continue;
        }

        const businessName = cleanBusinessName(
          result.title,
          website.domain,
        );

        if (!businessName) {
          invalidCount += 1;
          continue;
        }

        const {
          data: candidate,
          error: insertError,
        } = await db
          .from("crm_lead_candidates")
          .insert({
            business_name: businessName,

            domain: website.domain,

            website_url: website.websiteUrl,

            country: item.countryName,

            company_type:
              companyTypeForSegment(item.segment),

            /*
             * Never guess email addresses or people.
             * Phase 3 only discovers the company.
             */
            business_email: null,
            email_type: "unknown",
            email_verification_status:
              "unverified",

            source: "brave_web",

            source_name:
              "Brave Search automated discovery",

            source_external_id:
              sourceExternalId(website.domain),

            source_url: result.url,

            research_status: "new",

            qualification_status: "new",

            compliance_status: "review",

            research_notes:
              result.description
                ?.replace(/\s+/g, " ")
                .trim()
                .slice(0, 500) || null,

            created_by: createdBy,
          })
          .select("id")
          .single();

        if (insertError) {
          /*
           * 23505 protects against a concurrent run
           * discovering the same source/domain.
           */
          if (insertError.code === "23505") {
            duplicateCount += 1;
            knownDomains.add(website.domain);
            continue;
          }

          errorCount += 1;

          if (!firstError) {
            firstError = insertError.message;
          }

          continue;
        }

        if (!candidate) {
          errorCount += 1;
          continue;
        }

        stagedCount += 1;

        knownDomains.add(website.domain);

        await db
          .from("crm_candidate_activities")
          .insert({
            candidate_id: candidate.id,

            activity_type: "imported",

            details: {
              source:
                "Brave Search automated discovery",

              discovery_run_id: run.id,

              query: item.query,

              target_country:
                item.countryName,

              segment: item.segment,

              original_result_url:
                result.url,
            },

            created_by: createdBy,
          });
      }
    } catch (error) {
      errorCount += 1;

      const message =
        error instanceof Error
          ? error.message
          : "Unknown prospect discovery error.";

      if (!firstError) {
        firstError = message;
      }

      executedQueries.push({
        query: item.query,
        country: item.country,
        segment: item.segment,
        result_count: 0,
      });
    }
  }

  /*
   * Hand every newly discovered company to
   * the existing Phase 2 deterministic intelligence engine.
   */
  if (stagedCount > 0) {
    const { error: refreshError } = await db.rpc(
      "refresh_crm_prospecting_intelligence",
    );

    if (refreshError) {
      errorCount += 1;

      if (!firstError) {
        firstError = `Phase 2 refresh failed: ${refreshError.message}`;
      }
    }
  }

  const status =
    errorCount === 0
      ? "completed"
      : searchCount > 0
        ? "partial"
        : "failed";

  await finishRun({
    status,

    search_count: searchCount,

    discovered_count: discoveredCount,

    staged_count: stagedCount,

    duplicate_count: duplicateCount,

    invalid_count: invalidCount,

    error_count: errorCount,

    error_message: firstError,

    metadata: {
      daily_limit: dailyLimit,
      previously_used_today: alreadyUsed,
      queries: executedQueries,
    },
  });

  return {
    runId: run.id,
    status,
    searches: searchCount,
    results: discoveredCount,
    staged: stagedCount,
    duplicates: duplicateCount,
    invalid: invalidCount,
    errors: errorCount,
  };
}
