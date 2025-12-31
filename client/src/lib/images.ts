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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function convertFileToWebp(
  file: File,
  quality = 0.9,
  maxEdge = 512
): Promise<File> {
  if (file.type === "image/webp") return file;
  if (!file.type.startsWith("image/")) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    if (!width || !height) return file;

    // Downscale oversized avatars to save bandwidth.
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    if (scale < 1) {
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (!blob) return file;

    const nextName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], nextName, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
