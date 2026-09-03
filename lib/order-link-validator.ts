import { linkRules, validateCampaignLink } from "./order-service-experience";

export type OrderLinkValidation = {
  valid: boolean;
  severity: "success" | "warning" | "error";
  detectedType: string | null;
  message: string;
  suggestion?: string;
};

type Input = { platform: string; serviceCode: string; serviceName?: string; destinationUrl: string };

function detectType(platform: string, url: URL) {
  const path = url.pathname.toLowerCase();
  const host = url.hostname.toLowerCase();
  if (platform === "instagram") return /\/(p|reel|tv)\//.test(path) ? (path.includes("reel") ? "reel" : "post") : "profile";
  if (platform === "youtube") return host === "youtu.be" || path.includes("/watch") || path.includes("/shorts/") ? (path.includes("shorts") ? "short" : "video") : /\/(@|channel\/|c\/|user\/)/.test(path) ? "channel" : "unknown";
  if (platform === "facebook") return /\/groups\//.test(path) ? "group" : /\/(posts|reel|videos|watch)\//.test(path) || url.searchParams.has("v") ? "post or video" : "page or profile";
  if (platform === "linkedin") return /\/(posts|feed\/update)\//.test(path) ? "post" : /\/(in|company)\//.test(path) ? "profile or company" : "unknown";
  if (platform === "tiktok") return /\/video\//.test(path) ? "video" : /\/@[^/]+/.test(path) ? "profile" : "unknown";
  if (platform === "telegram") return /^\/(?:s\/)?[^/]+\/\d+\/?$/.test(path) ? "post" : /\/[^/]+/.test(path) ? "channel or group" : "unknown";
  if (platform === "x") return /\/status\//.test(path) ? "post" : "profile";
  return "unknown";
}

export function validateOrderLink({ platform, serviceCode, destinationUrl }: Input): OrderLinkValidation {
  const value = destinationUrl.trim();
  const rule = linkRules[serviceCode];
  if (!value) return { valid: false, severity: "error", detectedType: null, message: rule ? `${rule.label} is required.` : "A destination link is required." };
  if (!rule) return { valid: false, severity: "error", detectedType: null, message: "This service is not available for checkout." };
  const legacyError = validateCampaignLink(value, rule);
  if (legacyError) return { valid: false, severity: "error", detectedType: null, message: legacyError, suggestion: rule.helper };

  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); } catch { return { valid: false, severity: "error", detectedType: null, message: rule.error }; }
  const detectedType = detectType(platform, url);
  const contentService = /(likes|views|comments|saves|shares|watch-hours|reactions|votes)/.test(serviceCode) && serviceCode !== "tiktok-story-views";
  const accountService = /(followers|subscribers|members)/.test(serviceCode);
  if (contentService && ["profile", "channel", "page or profile", "profile or company"].includes(detectedType)) {
    return { valid: false, severity: "error", detectedType, message: `This looks like a ${detectedType}. This service requires a post, reel, or video link.`, suggestion: rule.helper };
  }
  if (accountService && ["post", "reel", "video", "short", "post or video"].includes(detectedType)) {
    return { valid: false, severity: "error", detectedType, message: `This looks like a ${detectedType}. This service requires an account, profile, page, or channel link.`, suggestion: rule.helper };
  }
  if (detectedType === "unknown") return { valid: true, severity: "warning", detectedType, message: "We could not identify the exact destination type. Please review the link before checkout.", suggestion: rule.helper };
  return { valid: true, severity: "success", detectedType, message: `${detectedType.replace(/\b\w/g, (letter) => letter.toUpperCase())} link detected.` };
}
