import { activeSmmServices, type SmmService } from "./smm-service-catalog";

export type LinkRule = {
  label: string;
  placeholder: string;
  helper: string;
  hosts: string[];
  pathHint?: RegExp;
  error: string;
};

export const customerOrderServices = activeSmmServices;

function normalizeServiceToken(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function canonicalServiceCode(service: SmmService) {
  const normalizedCode = normalizeServiceToken(service.code);
  const catalogCodeMatch = customerOrderServices.find((candidate) => normalizeServiceToken(candidate.code) === normalizedCode);
  if (catalogCodeMatch) return catalogCodeMatch.code;

  const normalizedPlatform = normalizeServiceToken(service.platform);
  const normalizedName = normalizeServiceToken(service.name);
  return customerOrderServices.find((candidate) =>
    normalizeServiceToken(candidate.platform) === normalizedPlatform && normalizeServiceToken(candidate.name) === normalizedName,
  )?.code ?? normalizedCode;
}

/**
 * Combines the static customer catalog with protected live facts. Identity is
 * normalized from both canonical code and platform/name, so a live record
 * replaces its static counterpart even when an upstream code is an alias.
 */
export function mergeCustomerOrderServices(liveServices: readonly SmmService[] = []): SmmService[] {
  const servicesByIdentity = new Map<string, SmmService>();

  const add = (service: SmmService) => {
    const code = canonicalServiceCode(service);
    const identity = `${normalizeServiceToken(service.platform)}:${code}`;
    servicesByIdentity.set(identity, { ...service, code: code as SmmService["code"] });
  };

  for (const service of customerOrderServices) {
    if (!service.requiresLiveCatalogFacts) add(service);
  }
  for (const service of liveServices) add(service);

  return [...servicesByIdentity.values()];
}

export const serviceExperience: Record<string, { name: string; outcome: string; required: string }> = {
  "instagram-followers": { name: "Instagram Followers", outcome: "Stronger profile discovery and a broader visible audience.", required: "Public Instagram profile link" },
  "instagram-likes": { name: "Instagram Likes", outcome: "More visible interaction around a selected post or reel.", required: "Public Instagram post or reel link" },
  "instagram-views": { name: "Instagram Views", outcome: "Expanded discovery for a selected reel or video post.", required: "Public Instagram post or reel link" },
  "instagram-comments": { name: "Instagram Comments", outcome: "More visible conversation and social proof around a selected post or reel.", required: "Public Instagram post or reel link" },
  "instagram-saves": { name: "Instagram Saves", outcome: "Stronger save activity around a selected post or reel.", required: "Public Instagram post or reel link" },
  "instagram-shares": { name: "Instagram Shares", outcome: "Expanded sharing activity around a selected post or reel.", required: "Public Instagram post or reel link" },
  "youtube-subscribers": { name: "YouTube Subscribers", outcome: "Broader channel discovery and stronger audience momentum.", required: "Public YouTube channel link" },
  "youtube-likes": { name: "YouTube Likes", outcome: "Additional engagement discovery around a selected video.", required: "Public YouTube video link" },
  "youtube-views": { name: "YouTube Views", outcome: "Wider video discovery and improved visible reach.", required: "Public YouTube video link" },
  "youtube-comments": { name: "YouTube Comments", outcome: "More visible conversation and engagement around a selected video.", required: "Public YouTube video link" },
  "youtube-watch-hours": { name: "YouTube Watch Hours", outcome: "Extended viewing activity around a selected public video.", required: "Public YouTube video link" },
  "facebook-followers": { name: "Facebook Followers", outcome: "Expanded discovery for a page or public profile.", required: "Public Facebook page or profile link" },
  "facebook-group-members": { name: "Facebook Group Members", outcome: "A clearer visible community size for an accessible Facebook Group.", required: "Public Facebook Group link" },
  "facebook-likes": { name: "Facebook Likes", outcome: "More visible engagement around a selected Facebook post.", required: "Public Facebook post or video link" },
  "facebook-views": { name: "Facebook Views", outcome: "Broader discovery for selected Facebook video content.", required: "Public Facebook post or video link" },
  "facebook-shares": { name: "Facebook Shares", outcome: "Broader distribution and visible sharing for a selected Facebook post.", required: "Public Facebook post link" },
  "linkedin-followers": { name: "LinkedIn Followers", outcome: "Professional audience discovery for a profile or company page.", required: "Public LinkedIn profile or company page" },
  "linkedin-likes": { name: "LinkedIn Likes", outcome: "Professional engagement discovery for a selected post.", required: "Public LinkedIn post link" },
  "telegram-members": { name: "Telegram Members", outcome: "Broader community discovery for a public channel or group.", required: "Public Telegram channel or group link" },
  "telegram-post-views": { name: "Telegram Post Views", outcome: "More visible viewing activity on a selected public Telegram post.", required: "Public Telegram post/message link" },
  "telegram-post-reactions": { name: "Telegram Post Reactions", outcome: "More visible reaction activity on a selected public Telegram post.", required: "Public Telegram post/message link" },
  "telegram-poll-votes": { name: "Telegram Poll Votes", outcome: "More voting activity on a selected public Telegram poll.", required: "Public Telegram poll message link" },
  "tiktok-followers": { name: "TikTok Followers", outcome: "Expanded profile discovery and creator audience momentum.", required: "Public TikTok profile link" },
  "tiktok-likes": { name: "TikTok Likes", outcome: "More engagement discovery around a selected TikTok video.", required: "Public TikTok video link" },
  "tiktok-views": { name: "TikTok Views", outcome: "Wider discovery and visible reach for a selected video.", required: "Public TikTok video link" },
  "x-followers": { name: "Twitter/X Followers", outcome: "Broader profile discovery and stronger visible audience presence.", required: "Public Twitter/X profile link" },
  "twitter-likes": { name: "Twitter / X Likes", outcome: "More visible engagement on a selected public post.", required: "Public Twitter/X post link" },
  "twitter-views": { name: "Twitter / X Views", outcome: "More visible reach on a selected public post.", required: "Public Twitter/X post link" },
  "twitter-retweets": { name: "Twitter / X Retweets", outcome: "More visible sharing and distribution for a selected public post.", required: "Public Twitter/X post link" },
  "twitter-crypto-followers": { name: "Twitter / X Crypto-Based Followers", outcome: "Crypto-focused profile audience growth at a fixed delivery speed.", required: "Public Twitter/X profile link" },
  "twitter-crypto-likes": { name: "Twitter / X Crypto-Based Likes", outcome: "Crypto-focused engagement on a selected public post.", required: "Public Twitter/X post link" },
  "twitter-crypto-retweets": { name: "Twitter / X Crypto-Based Retweets", outcome: "Crypto-focused distribution for a selected public post.", required: "Public Twitter/X post link" },
  "twitter-crypto-custom-comments": { name: "Twitter / X Crypto-Based Custom Comments", outcome: "Custom crypto-focused comments on a selected public post.", required: "Public Twitter/X post link and comments" },
};

export const linkRules: Record<string, LinkRule> = {
  "instagram-followers": { label: "Instagram profile link", placeholder: "https://instagram.com/yourprofile", helper: "Use the public URL for the profile you want to grow.", hosts: ["instagram.com"], error: "Enter a valid public Instagram profile link." },
  "instagram-likes": { label: "Instagram post or reel link", placeholder: "https://instagram.com/reel/...", helper: "Use the exact public post or reel that should receive engagement.", hosts: ["instagram.com"], pathHint: /\/(p|reel|tv)\//i, error: "Enter a valid Instagram post or reel link." },
  "instagram-views": { label: "Instagram post or reel link", placeholder: "https://instagram.com/reel/...", helper: "Use the exact public reel or video post you want people to discover.", hosts: ["instagram.com"], pathHint: /\/(p|reel|tv)\//i, error: "Enter a valid Instagram post or reel link." },
  "instagram-comments": { label: "Instagram post or reel link", placeholder: "https://instagram.com/p/...", helper: "Use the exact public post or Reel where comments should be delivered.", hosts: ["instagram.com"], pathHint: /\/(p|reel|tv)\//i, error: "Enter a valid Instagram post or reel link." },
  "instagram-saves": { label: "Instagram post or reel link", placeholder: "https://instagram.com/p/...", helper: "Use the exact public post or Reel where saves should be delivered.", hosts: ["instagram.com"], pathHint: /\/(p|reel|tv)\//i, error: "Enter a valid Instagram post or reel link." },
  "instagram-shares": { label: "Instagram post or reel link", placeholder: "https://instagram.com/p/...", helper: "Use the exact public post or Reel where share activity should be delivered.", hosts: ["instagram.com"], pathHint: /\/(p|reel|tv)\//i, error: "Enter a valid Instagram post or reel link." },
  "youtube-subscribers": { label: "YouTube channel link", placeholder: "https://youtube.com/@yourchannel", helper: "Use your public channel URL, handle URL, or channel ID URL.", hosts: ["youtube.com"], pathHint: /\/(@|channel\/|c\/|user\/)/i, error: "Enter a valid public YouTube channel link." },
  "youtube-likes": { label: "YouTube video link", placeholder: "https://youtube.com/watch?v=...", helper: "Use the exact public video or Short you want people to discover.", hosts: ["youtube.com", "youtu.be"], error: "Enter a valid public YouTube video link." },
  "youtube-views": { label: "YouTube video link", placeholder: "https://youtube.com/watch?v=...", helper: "Use the exact public video or Short you want people to discover.", hosts: ["youtube.com", "youtu.be"], error: "Enter a valid public YouTube video link." },
  "youtube-comments": { label: "YouTube video link", placeholder: "https://youtube.com/watch?v=...", helper: "Use the exact public YouTube video or Short URL. Keep the video public while the order is processing.", hosts: ["youtube.com", "youtu.be"], pathHint: /\/(watch|shorts)\/|^\/[A-Za-z0-9_-]+\/?$/i, error: "Enter a valid public YouTube video link." },
  "youtube-watch-hours": { label: "YouTube video link", placeholder: "https://youtube.com/watch?v=...", helper: "Use the exact public YouTube video or Short URL. Keep the video public while the order is processing.", hosts: ["youtube.com", "youtu.be"], pathHint: /\/(watch|shorts)\/|^\/[A-Za-z0-9_-]+\/?$/i, error: "Enter a valid public YouTube video link." },
  "facebook-followers": { label: "Facebook page/profile link", placeholder: "https://facebook.com/yourpage", helper: "Use the public page or profile URL you want to grow.", hosts: ["facebook.com", "fb.com"], error: "Enter a valid public Facebook page or profile link." },
  "facebook-group-members": { label: "Facebook Group link", placeholder: "https://facebook.com/groups/your-group", helper: "Use the exact accessible Facebook Group URL. Keep the group privacy settings unchanged while the order is processing.", hosts: ["facebook.com", "fb.com"], pathHint: /^\/groups\/[^/]+\/?$/i, error: "Enter a valid Facebook Group URL (facebook.com/groups/...)." },
  "facebook-likes": { label: "Facebook post/video link", placeholder: "https://facebook.com/yourpage/posts/...", helper: "Use the exact public Facebook post or video that should receive engagement.", hosts: ["facebook.com", "fb.watch"], error: "Enter a valid public Facebook post or video link." },
  "facebook-views": { label: "Facebook post/video link", placeholder: "https://facebook.com/watch/?v=...", helper: "Use the exact public Facebook video you want people to discover.", hosts: ["facebook.com", "fb.watch"], error: "Enter a valid public Facebook video link." },
  "facebook-shares": { label: "Facebook post link", placeholder: "https://facebook.com/yourpage/posts/...", helper: "Use the exact public Facebook post that should receive shares.", hosts: ["facebook.com"], error: "Enter a valid public Facebook post link." },
  "linkedin-followers": { label: "LinkedIn profile/company page link", placeholder: "https://linkedin.com/in/your-profile", helper: "Use a public personal profile or company page URL.", hosts: ["linkedin.com"], pathHint: /\/(in|company)\//i, error: "Enter a valid LinkedIn profile or company page link." },
  "linkedin-likes": { label: "LinkedIn post link", placeholder: "https://linkedin.com/posts/...", helper: "Use the exact public LinkedIn post that should receive engagement.", hosts: ["linkedin.com"], pathHint: /\/(posts|feed\/update)\//i, error: "Enter a valid public LinkedIn post link." },
  "telegram-members": { label: "Telegram channel/group link", placeholder: "https://t.me/yourchannel", helper: "Use a public channel or group invite URL.", hosts: ["t.me", "telegram.me"], error: "Enter a valid public Telegram channel or group link." },
  "telegram-post-views": { label: "Telegram post link", placeholder: "https://t.me/channelname/123", helper: "Submit the exact public Telegram post and keep it accessible while the order is processing.", hosts: ["t.me", "telegram.me"], pathHint: /^\/(?:s\/)?(?!joinchat(?:\/|$)|\+(?:[^/]+$))[^/]+\/\d+\/?$/i, error: "Enter a valid public Telegram post/message link." },
  "telegram-post-reactions": { label: "Telegram post link", placeholder: "https://t.me/channelname/123", helper: "Submit the exact public Telegram post that should receive reactions and keep it accessible while processing.", hosts: ["t.me", "telegram.me"], pathHint: /^\/(?:s\/)?(?!joinchat(?:\/|$)|\+(?:[^/]+$))[^/]+\/\d+\/?$/i, error: "Enter a valid public Telegram post/message link." },
  "telegram-poll-votes": { label: "Telegram poll post link", placeholder: "https://t.me/channelname/123", helper: "Submit the exact public Telegram post containing the poll, enter its answer number, and keep it accessible while processing.", hosts: ["t.me", "telegram.me"], pathHint: /^\/(?:s\/)?(?!joinchat(?:\/|$)|\+(?:[^/]+$))[^/]+\/\d+\/?$/i, error: "Enter a valid public Telegram poll message link." },
  "tiktok-followers": { label: "TikTok profile link", placeholder: "https://tiktok.com/@yourprofile", helper: "Use the public profile URL for the creator account.", hosts: ["tiktok.com"], pathHint: /\/@[^/]+\/?$/i, error: "Enter a valid public TikTok profile link." },
  "tiktok-likes": { label: "TikTok video link", placeholder: "https://tiktok.com/@username/video/...", helper: "Use the exact public TikTok video that should receive engagement.", hosts: ["tiktok.com"], pathHint: /\/video\//i, error: "Enter a valid public TikTok video link." },
  "tiktok-views": { label: "TikTok video link", placeholder: "https://tiktok.com/@username/video/...", helper: "Use the exact public TikTok video you want people to discover.", hosts: ["tiktok.com"], pathHint: /\/video\//i, error: "Enter a valid public TikTok video link." },
  "x-followers": { label: "Twitter/X profile link", placeholder: "https://x.com/yourprofile", helper: "Use the public profile URL and keep the handle unchanged during delivery.", hosts: ["x.com", "twitter.com"], error: "Enter a valid public Twitter/X profile link." },
  "twitter-likes": { label: "Twitter/X post link", placeholder: "https://x.com/username/status/...", helper: "Use the exact public post and keep it public while the order is processing.", hosts: ["x.com", "twitter.com"], pathHint: /^\/[^/]+\/status\/\d+\/?$/i, error: "Enter a valid public Twitter/X post link." },
  "twitter-views": { label: "Twitter/X post link", placeholder: "https://x.com/username/status/...", helper: "Use the exact public post and keep it public while the order is processing.", hosts: ["x.com", "twitter.com"], pathHint: /^\/[^/]+\/status\/\d+\/?$/i, error: "Enter a valid public Twitter/X post link." },
  "twitter-retweets": { label: "Twitter/X post link", placeholder: "https://x.com/username/status/...", helper: "Use the exact public post and keep it public while the order is processing.", hosts: ["x.com", "twitter.com"], pathHint: /^\/[^/]+\/status\/\d+\/?$/i, error: "Enter a valid public Twitter/X post link." },
  "twitter-crypto-followers": { label: "Twitter/X profile link", placeholder: "https://x.com/yourprofile", helper: "Use the public profile URL and keep it public during fixed-speed delivery.", hosts: ["x.com", "twitter.com"], pathHint: /^\/(?!.*\/status\/)[^/]+\/?$/i, error: "Enter a valid public Twitter/X profile link." },
  "twitter-crypto-likes": { label: "Twitter/X post link", placeholder: "https://x.com/username/status/...", helper: "Use the exact public post and keep it public during delivery.", hosts: ["x.com", "twitter.com"], pathHint: /^\/[^/]+\/status\/\d+\/?$/i, error: "Enter a valid Twitter/X post link." },
  "twitter-crypto-retweets": { label: "Twitter/X post link", placeholder: "https://x.com/username/status/...", helper: "Use the exact public post and keep it public during delivery.", hosts: ["x.com", "twitter.com"], pathHint: /^\/[^/]+\/status\/\d+\/?$/i, error: "Enter a valid Twitter/X post link." },
  "twitter-crypto-custom-comments": { label: "Twitter/X post link", placeholder: "https://x.com/username/status/...", helper: "Use the exact public post and keep it public during delivery.", hosts: ["x.com", "twitter.com"], pathHint: /^\/[^/]+\/status\/\d+\/?$/i, error: "Enter a valid Twitter/X post link." },
};

export function validateCampaignLink(value: string, rule: LinkRule) {
  const trimmed = value.trim();
  if (!trimmed) return `${rule.label} is required.`;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const validHost = rule.hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
    if (!validHost || (rule.pathHint && !rule.pathHint.test(url.pathname))) return rule.error;
    return "";
  } catch {
    return rule.error;
  }
}

export function growthMethod(service: SmmService) {
  if (service.platform === "linkedin") {
    return "Professional audience discovery uses relevant profile or post placements, opt-in engagement opportunities, gradual pacing, and manual quality checks.";
  }
  if (service.platform === "telegram") {
    return "Community growth uses public channel or group discovery placements, opt-in growth tasks, gradual pacing, and ongoing delivery checks.";
  }
  if (service.platform === "youtube") {
    return service.code.includes("subscribers")
      ? "Channel discovery support helps interested viewers find and explore your public channel through creator and community placements."
      : "Video discovery support uses relevant content placements and opt-in engagement tasks to help more people find the public video.";
  }
  if (/(followers|subscribers|members)/.test(service.code)) {
    return "Profile discovery uses targeted placements and opt-in community tasks, with gradual delivery and consistency checks.";
  }
  return "Content discovery uses relevant placements and opt-in engagement tasks, with gradual delivery and manual quality checks.";
}
