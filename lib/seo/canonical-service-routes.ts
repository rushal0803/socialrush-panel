import { canonicalIndiaServicePaths, type IndiaServiceSlug } from "./canonical-india-services.ts";

// These first-batch canonicals have dedicated page files. Generating them
// again under [service] can overwrite their prerendered metadata/schema.
// Other service-route collisions require their own rendered-content audit.
const dedicatedBatchPaths = new Set(["/buy-instagram-followers-india", "/buy-facebook-followers-india"]);
export const canonicalServiceRoutes = Object.fromEntries(
  Object.entries(canonicalIndiaServicePaths)
    .filter(([, path]) => !dedicatedBatchPaths.has(path))
    .map(([slug, path]) => [path.slice(1), slug as IndiaServiceSlug]),
) as Record<string, IndiaServiceSlug>;
