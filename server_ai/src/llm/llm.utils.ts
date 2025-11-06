export function stripFences(s: string): string {
    if (!s)
        return s;
    const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1])
        return fenced[1].trim();
    const trimmed = s.trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("json"))
        return trimmed.slice(4).trim();
    return trimmed;
}
export function tryParseJsonLike(s: string): any | null {
    if (!s)
        return null;
    const t = s.trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    if (t.startsWith("{") && t.endsWith("}")) {
        try {
            return JSON.parse(t);
        }
        catch { }
    }
    return null;
}
export async function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}
