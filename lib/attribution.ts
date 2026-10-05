const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

/** Current-page campaign labels only; no tracking cookies, cross-site IDs or full URLs. */
export function currentAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return sanitizeAttribution(Object.fromEntries(new URLSearchParams(window.location.search)));
}

export function sanitizeAttribution(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const fields = input as Record<string, unknown>;
  return Object.fromEntries(keys.flatMap(key => typeof fields[key] === "string"
    ? [[key, fields[key].trim().replace(/[\u0000-\u001f]/g, "").slice(0, 120)]] : []));
}
