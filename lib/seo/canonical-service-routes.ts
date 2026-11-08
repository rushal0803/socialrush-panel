import { canonicalIndiaServicePaths, type IndiaServiceSlug } from "./canonical-india-services.ts";

// Canonicals retaining their /buy-... slug have dedicated app routes. Generating
// them again under [service] can overwrite their prerendered metadata/schema.
// TikTok also owns a dedicated canonical route without the buy- prefix.
export const canonicalServiceRoutes = Object.fromEntries(
  Object.entries(canonicalIndiaServicePaths)
    .filter(([slug, path]) => path !== `/${slug}` && path !== "/tiktok-followers")
    .map(([slug, path]) => [path.slice(1), slug as IndiaServiceSlug]),
) as Record<string, IndiaServiceSlug>;
