const blockedHost = (host: string) => {
  const value = host.toLowerCase().replace(/\.$/, "");
  return value === "localhost" || value.endsWith(".localhost") || value === "::1" ||
    /^(127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(value) ||
    value === "metadata.google.internal";
};

export function safePublicUrl(raw: string, allowedHosts?: readonly string[]) {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || !host || blockedHost(host) || url.username || url.password) return null;
    if (allowedHosts && !allowedHosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))) return null;
    return url;
  } catch { return null; }
}
