import type { SmmService } from "@/lib/smm-service-catalog";

export type RepeatOrderInput = {
  serviceName: string;
  platform: string;
  quantity: number;
  link: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizePlatform(value: string) {
  const normalized = normalize(value);
  return normalized === "twitter" || normalized === "twitter-x" || normalized === "x-twitter" ? "x" : normalized;
}

export function resolveRepeatOrderService(input: Pick<RepeatOrderInput, "serviceName" | "platform">, services: readonly SmmService[]) {
  const serviceName = normalize(input.serviceName);
  const platform = normalizePlatform(input.platform);

  const exact = services.find((service) =>
    normalize(service.name) === serviceName &&
    normalizePlatform(service.platform) === platform,
  );
  if (exact) return exact;

  const samePlatform = services.filter((service) => normalizePlatform(service.platform) === platform);
  return samePlatform.find((service) => {
    const code = normalize(service.code);
    const type = code.split("-").pop() || "";
    return serviceName === code || serviceName.endsWith(`-${type}`) || serviceName.includes(type);
  }) ?? null;
}

export function buildRepeatOrderVariantHref(input: RepeatOrderInput, services: readonly SmmService[], preserveTarget = true) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) return null;
  if (preserveTarget && !input.link.trim()) return null;
  const service = resolveRepeatOrderService(input, services);
  if (!service) return null;

  const params = new URLSearchParams({
    platform: service.platform,
    service: service.code,
    quantity: String(input.quantity),
    resume: "1",
    repeat: "1",
    repeatMode: preserveTarget ? "same_target" : "new_target",
  });
  if (preserveTarget) params.set("link", input.link.trim());
  return `/dashboard/new-order?${params}`;
}

export function buildRepeatOrderHref(input: RepeatOrderInput, services: readonly SmmService[]) {
  return buildRepeatOrderVariantHref(input, services, true);
}


export type RepeatHistoryItem = RepeatOrderInput & { createdAt: string };
export type FrequentRepeatPattern = {
  href: string;
  serviceName: string;
  platform: string;
  quantity: number;
  count: number;
  latestAt: string;
};

export function buildFrequentRepeatPatterns(
  items: readonly RepeatHistoryItem[],
  services: readonly SmmService[],
  minimumCount = 2,
  limit = 3,
): FrequentRepeatPattern[] {
  if (minimumCount < 2 || limit <= 0) return [];
  const groups = new Map<string, FrequentRepeatPattern>();

  for (const item of items) {
    const service = resolveRepeatOrderService(item, services);
    const href = buildRepeatOrderHref(item, services);
    if (!service || !href) continue;
    const key = [service.code, String(item.quantity), item.link.trim()].join("\u0000");
    const current = groups.get(key);
    if (!current) {
      groups.set(key, {
        href,
        serviceName: service.name,
        platform: service.platform,
        quantity: item.quantity,
        count: 1,
        latestAt: item.createdAt,
      });
      continue;
    }
    current.count += 1;
    if (Date.parse(item.createdAt) > Date.parse(current.latestAt)) {
      current.latestAt = item.createdAt;
      current.href = href;
    }
  }

  return [...groups.values()]
    .filter((item) => item.count >= minimumCount)
    .sort((a, b) => b.count - a.count || Date.parse(b.latestAt) - Date.parse(a.latestAt))
    .slice(0, limit);
}
