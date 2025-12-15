const PUBLIC_BASE = (import.meta.env.VITE_S3_PUBLIC_BASE || "").replace(/\/+$/, "");
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function apiImagesBase(): string | undefined {
  if (!API_BASE) return undefined;
  // If API_BASE already ends with /api, append /images; otherwise add /api/images.
  if (/\/api$/i.test(API_BASE)) return `${API_BASE}/images`;
  return `${API_BASE}/api/images`;
}

function makeApiImage(key: string): string {
  const base = apiImagesBase();
  if (!base) return `/api/images/${key}`;
  return `${base}/${key}`;
}

export function toProxiedImage(url?: string | null): string | undefined {
  if (!url) return url ?? undefined;
  // Normalize proxy path (even if user typed without a leading slash)
  if (url.startsWith("/api/images/")) {
    const key = url.replace(/^\/api\/images\//, "");
    return makeApiImage(key);
  }
  if (url.startsWith("api/images/")) {
    const key = url.replace(/^api\/images\//, "");
    return makeApiImage(key);
  }
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("/")) return url;
  const candidates = [PUBLIC_BASE].filter(Boolean);
  // Common idrive path-style base as fallback
  const matchIdrive = url.match(/^https?:\/\/[^/]*idrivee2\.com\/users-avatar\/(.+)/i);
  if (matchIdrive) {
    return makeApiImage(matchIdrive[1]);
  }
  for (const base of candidates) {
    if (base && url.startsWith(base)) {
      const key = url.slice(base.length).replace(/^\/+/, "");
      return makeApiImage(key);
    }
  }
  return url;
}
