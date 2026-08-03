import "server-only";
import { safePublicUrl } from "@/lib/security/url";

export type CountDetectionResult = {
  success: boolean;
  count: number | null;
  platform: string;
  type: string;
  message: string;
};

type DetectionInput = {
  url: string;
  platform?: string | null;
  serviceName?: string | null;
  serviceCode?: string | null;
};

const failed = (platform: string, type: string, message: string): CountDetectionResult => ({
  success: false,
  count: null,
  platform,
  type,
  message,
});

function countType(input: DetectionInput) {
  const value = `${input.serviceCode ?? ""} ${input.serviceName ?? ""}`.toLowerCase();
  if (value.includes("subscriber")) return "subscribers";
  if (value.includes("member")) return "members";
  if (value.includes("like")) return "likes";
  if (value.includes("view")) return "views";
  return "followers";
}

function normalizeCount(value: string) {
  const clean = value.trim().toLowerCase().replace(/,/g, "");
  const match = clean.match(/^([\d.]+)\s*([kmb])?$/);
  if (!match) return null;
  const multiplier = match[2] === "k" ? 1_000 : match[2] === "m" ? 1_000_000 : match[2] === "b" ? 1_000_000_000 : 1;
  const count = Math.round(Number(match[1]) * multiplier);
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

async function fetchText(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_500);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SocialRUSHCountCheck/1.0)" },
    });
    if (!response.ok) throw new Error(`Public page returned ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function detectYouTube(url: URL, type: string): Promise<CountDetectionResult> {
  const key = process.env.YOUTUBE_DATA_API_KEY;
  if (!key) return failed("youtube", type, "YouTube count detection requires YOUTUBE_DATA_API_KEY. Enter the count manually.");

  const host = url.hostname.replace(/^www\./, "");
  let videoId = host === "youtu.be" ? url.pathname.split("/")[1] : url.searchParams.get("v");
  if (!videoId && /\/(shorts|live)\//.test(url.pathname)) videoId = url.pathname.split("/")[2];

  let endpoint: URL;
  if (videoId && (type === "views" || type === "likes")) {
    endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
    endpoint.searchParams.set("part", "statistics");
    endpoint.searchParams.set("id", videoId);
  } else {
    endpoint = new URL("https://www.googleapis.com/youtube/v3/channels");
    endpoint.searchParams.set("part", "statistics");
    const channelMatch = url.pathname.match(/\/channel\/([^/]+)/);
    const handleMatch = url.pathname.match(/\/@([^/]+)/);
    if (channelMatch) endpoint.searchParams.set("id", channelMatch[1]);
    else if (handleMatch) endpoint.searchParams.set("forHandle", handleMatch[1]);
    else return failed("youtube", type, "Use a YouTube channel ID URL or @handle URL for automatic detection.");
  }
  endpoint.searchParams.set("key", key);

  try {
    const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(4_500) });
    if (!response.ok) return failed("youtube", type, `YouTube API returned ${response.status}. Update manually.`);
    const payload = (await response.json()) as { items?: Array<{ statistics?: Record<string, string> }> };
    const statistics = payload.items?.[0]?.statistics;
    const raw = type === "likes" ? statistics?.likeCount : type === "views" ? statistics?.viewCount : statistics?.subscriberCount;
    const count = raw ? Number(raw) : NaN;
    return Number.isSafeInteger(count)
      ? { success: true, count, platform: "youtube", type, message: "Count detected using the YouTube Data API." }
      : failed("youtube", type, "The requested YouTube count is hidden or unavailable. Update manually.");
  } catch {
    return failed("youtube", type, "YouTube count request timed out. Update manually.");
  }
}

async function detectTelegram(url: URL, type: string): Promise<CountDetectionResult> {
  const channel = url.pathname.split("/").filter(Boolean).pop();
  if (!channel || channel.startsWith("+")) return failed("telegram", type, "Private Telegram links cannot be checked automatically.");
  try {
    const publicUrl = new URL(`https://t.me/${channel}`);
    const html = await fetchText(publicUrl);
    const match = html.match(/tgme_page_extra[^>]*>\s*([\d.,]+\s*[KMB]?)\s+(members|subscribers)/i);
    const count = match ? normalizeCount(match[1]) : null;
    return count !== null
      ? { success: true, count, platform: "telegram", type, message: "Count detected from the public Telegram page." }
      : failed("telegram", type, "Telegram did not expose a reliable public member count. Update manually.");
  } catch {
    return failed("telegram", type, "Telegram count could not be fetched. Update manually.");
  }
}

async function detectInstagram(url: URL, type: string): Promise<CountDetectionResult> {
  try {
    const html = await fetchText(url);
    const patterns =
      type === "followers"
        ? [/"edge_followed_by":\{"count":(\d+)/, /([\d.,]+\s*[KMB]?)\s+Followers/i]
        : type === "likes"
          ? [/"edge_liked_by":\{"count":(\d+)/, /([\d.,]+\s*[KMB]?)\s+likes/i]
          : [/"video_view_count":(\d+)/, /([\d.,]+\s*[KMB]?)\s+views/i];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      const count = match ? normalizeCount(match[1]) : null;
      if (count !== null) return { success: true, count, platform: "instagram", type, message: "Count detected from public Instagram data." };
    }
    return failed("instagram", type, "Instagram did not expose a reliable public count. Update manually.");
  } catch {
    return failed("instagram", type, "Instagram blocked or did not return public count data. Update manually.");
  }
}

export async function detectPublicCount(input: DetectionInput): Promise<CountDetectionResult> {
  const platform = String(input.platform ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const type = countType(input);
  const url = safePublicUrl(input.url);
  if (!url) return failed(platform || "unknown", type, "The submitted link is not a valid public URL.");

  if (platform.includes("youtube") || /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(url.hostname)) {
    const allowed = safePublicUrl(input.url, ["youtube.com", "youtu.be"]); return allowed ? detectYouTube(allowed, type) : failed("youtube", type, "Use a public YouTube URL.");
  }
  if (platform.includes("telegram") || url.hostname === "t.me") {
    const allowed = safePublicUrl(input.url, ["t.me"]); return allowed ? detectTelegram(allowed, type) : failed("telegram", type, "Use a public Telegram URL.");
  }
  if (platform.includes("instagram") || url.hostname.endsWith("instagram.com")) {
    const allowed = safePublicUrl(input.url, ["instagram.com"]); return allowed ? detectInstagram(allowed, type) : failed("instagram", type, "Use a public Instagram URL.");
  }
  if (platform.includes("linkedin")) return failed("linkedin", type, "LinkedIn does not expose this count reliably without authorized API access. Update manually.");
  if (platform.includes("twitter") || platform === "x") return failed("twitter", type, "X does not expose this count reliably without authorized API access. Update manually.");
  return failed(platform || "unknown", type, "Automatic count detection is unavailable for this platform. Update manually.");
}
