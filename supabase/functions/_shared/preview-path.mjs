export const ALLOWED_PREVIEW_EXTENSIONS = new Set([
  "html", "js", "css", "json", "png", "jpg", "jpeg", "webp", "svg", "ico",
  "woff", "woff2", "ttf", "otf", "glb", "gltf", "bin", "mp3", "ogg", "wav",
  "mp4", "webm", "wasm", "hdr", "ktx2"
]);

export function isSafePreviewPath(value) {
  if (typeof value !== "string" || value.length < 1 || value.length > 240) return false;
  if (value.startsWith("/") || value.includes("\\") || value.includes("?") || value.includes("#")) return false;
  if (!/^[A-Za-z0-9._/-]+$/.test(value)) return false;
  const segments = value.split("/");
  if (segments.length > 10 || segments.some((part) => !part || part === "." || part === ".." || part.startsWith("."))) return false;
  const extension = value.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_PREVIEW_EXTENSIONS.has(extension);
}
