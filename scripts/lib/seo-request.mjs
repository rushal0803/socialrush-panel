import { request as httpRequest } from "node:http";

// Exercise production-host routing against an isolated loopback build without
// changing canonical expectations or sending simulated headers to a deployment.
export function seoRequest(path, baseUrl, transportOrigin) {
  const source = new URL(path, baseUrl);
  if (!transportOrigin) return { url: source, headers: {} };
  const transport = new URL(transportOrigin);
  if (source.origin !== "https://www.getsocialrush.com" ||
      transport.protocol !== "http:" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(transport.hostname) ||
      transport.username || transport.password || transport.pathname !== "/" ||
      transport.search || transport.hash) {
    throw new Error("SEO_TRANSPORT_ORIGIN requires a plain HTTP loopback origin and the production canonical base");
  }
  return {
    url: new URL(source.pathname + source.search, transport),
    headers: { host: source.host, "x-forwarded-proto": "https" },
  };
}

export async function fetchSeo(path, baseUrl, transportOrigin, init = {}, redirects = 0) {
  const request = seoRequest(path, baseUrl, transportOrigin);
  if (!transportOrigin) return fetch(request.url, init);
  // Node's fetch can discard a custom Host header. Use HTTP only for the
  // validated loopback transport so the test actually reaches host-based routes.
  const response = await new Promise((resolve, reject) => {
    const req = httpRequest(request.url, {
      method: "GET", headers: { ...init.headers, ...request.headers }, signal: init.signal,
    }, incoming => {
      const chunks = [];
      incoming.on("data", chunk => chunks.push(chunk));
      incoming.on("error", reject);
      incoming.on("end", () => resolve(new Response(Buffer.concat(chunks), {
        status: incoming.statusCode,
        headers: Object.fromEntries(Object.entries(incoming.headers).filter(([, value]) => value !== undefined).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : value])),
      })));
    });
    req.on("error", reject);
    req.end();
  });
  if ((init.redirect ?? "follow") === "follow" && [301, 302, 303, 307, 308].includes(response.status) && response.headers.has("location")) {
    if (redirects >= 5) throw new Error("Too many local SEO redirects");
    return fetchSeo(new URL(response.headers.get("location"), new URL(path, baseUrl)), baseUrl, transportOrigin, init, redirects + 1);
  }
  return response;
}
