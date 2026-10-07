import { SEO_SITE_URL } from "@/lib/seo/metadata";

export type DistributionChannel = "linkedin" | "x" | "whatsapp" | "community";

type ChannelConfig = {
  label: string;
  source: string;
  medium: string;
};

export const distributionChannels: Record<DistributionChannel, ChannelConfig> = {
  linkedin: { label: "LinkedIn", source: "linkedin", medium: "social" },
  x: { label: "X / Twitter", source: "x", medium: "social" },
  whatsapp: { label: "WhatsApp", source: "whatsapp", medium: "messaging" },
  community: { label: "Community", source: "community", medium: "referral" },
};

function cleanContentKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildTrackedDistributionUrl({
  path,
  channel,
  content,
  campaign = "content_distribution",
}: {
  path: string;
  channel: DistributionChannel;
  content: string;
  campaign?: string;
}) {
  const target = new URL(path, SEO_SITE_URL);
  const site = new URL(SEO_SITE_URL);
  if (target.origin !== site.origin) {
    throw new Error("Distribution targets must stay on the SocialRUSH canonical origin.");
  }

  const config = distributionChannels[channel];
  target.searchParams.set("utm_source", config.source);
  target.searchParams.set("utm_medium", config.medium);
  target.searchParams.set("utm_campaign", campaign);
  target.searchParams.set("utm_content", cleanContentKey(content));

  return target.toString();
}

export function buildDistributionShareUrl({
  channel,
  trackedUrl,
  title,
}: {
  channel: Exclude<DistributionChannel, "community">;
  trackedUrl: string;
  title: string;
}) {
  if (channel === "linkedin") {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(trackedUrl)}`;
  }
  if (channel === "x") {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(trackedUrl)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${trackedUrl}`)}`;
}
