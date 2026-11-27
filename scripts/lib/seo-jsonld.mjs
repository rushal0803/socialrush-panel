// Inspect actual JSON-LD, not escaped hydration text or unrelated script content.
export function structuredType(html, type) {
  function containsType(value) {
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(containsType);
    const types = value["@type"];
    if (types === type || (Array.isArray(types) && types.includes(type))) return true;
    return Object.values(value).some(containsType);
  }

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (!/\btype\s*=\s*(["'])application\/ld\+json\1/i.test(match[1])) continue;
    try {
      if (containsType(JSON.parse(match[2]))) return true;
    } catch {
      // Malformed JSON cannot establish the requested schema type.
    }
  }
  return false;
}
