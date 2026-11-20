/** These hosts are engineering environments, never production acquisition. */
export function isInternalAnalyticsHost(hostname: string | undefined): boolean {
  const host = (hostname || "").toLowerCase().replace(/\.$/, "");
  return host === "localhost" || host.endsWith(".localhost") ||
    host === "127.0.0.1" || host === "[::1]" || host === "::1" ||
    host === "vercel.app" || host.endsWith(".vercel.app");
}

/** VERCEL_ENV covers custom-domain previews as well as default preview hosts. */
export function shouldIgnoreAnalyticsCollection(hostname: string | undefined, deploymentEnvironment?: string): boolean {
  return deploymentEnvironment === "preview" || deploymentEnvironment === "development" || isInternalAnalyticsHost(hostname);
}
