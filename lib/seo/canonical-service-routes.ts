import { canonicalIndiaServicePaths, type IndiaServiceSlug } from "./canonical-india-services.ts";

// These audited batch canonicals have dedicated page files. Generating them
// again under [service] can overwrite their prerendered metadata/schema.
// Unaudited service-route collisions require their own rendered-content audit.
const dedicatedBatchPaths = new Set([
  "/buy-instagram-followers-india",
  "/buy-facebook-followers-india",
  "/buy-instagram-comments-india",
  "/buy-instagram-saves-india",
  "/buy-instagram-shares-india",
  "/buy-youtube-comments-india",
  "/buy-facebook-shares-india",
  "/buy-facebook-group-members-india",
]);
export const canonicalServiceRoutes = Object.fromEntries(
  Object.entries(canonicalIndiaServicePaths)
    .filter(([, path]) => !dedicatedBatchPaths.has(path))
    .map(([slug, path]) => [path.slice(1), slug as IndiaServiceSlug]),
) as Record<string, IndiaServiceSlug>;
