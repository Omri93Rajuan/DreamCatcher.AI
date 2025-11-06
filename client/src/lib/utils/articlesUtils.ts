export function stripHtml(s: string) {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, "");
}

export function clampText(s: string, n: number) {
  const t = stripHtml(s).trim().replace(/\s+/g, " ");
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

export function calcReadingTime(text: string) {
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  const wpm = 220;
  return Math.max(1, Math.round(words / wpm));
}

export function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
