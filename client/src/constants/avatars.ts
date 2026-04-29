export const BUILT_IN_AVATARS = [
  "/avatars/avatar-1.webp",
  "/avatars/avatar-2.webp",
  "/avatars/avatar-3.webp",
  "/avatars/avatar-4.webp",
  "/avatars/avatar-5.webp",
  "/avatars/avatar-6.webp",
  "/avatars/avatar-7.webp",
  "/avatars/avatar-8.webp",
  "/avatars/avatar-9.webp",
  "/avatars/avatar-10.webp",
  "/avatars/avatar-11.webp",
  "/avatars/avatar-12.webp",
];

export function normalizeBuiltInAvatarPath(value?: string | null) {
  if (!value) return "";
  const normalized = value
    .trim()
    .split(/[?#]/)[0]
    .replace(/\/+$/, "")
    .replace(/^\/+/, "");

  return /^avatars\/[\w.-]+\.(webp|png|jpe?g)$/i.test(normalized)
    ? `/${normalized}`
    : "";
}

export function isBuiltInAvatar(value?: string | null) {
  const normalized = normalizeBuiltInAvatarPath(value);
  return !!normalized && BUILT_IN_AVATARS.includes(normalized);
}
