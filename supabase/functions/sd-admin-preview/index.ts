import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { isSafePreviewPath } from "../_shared/preview-path.mjs";

const DEFAULT_ALLOWED_ORIGINS = ["https://edward11031709.github.io"];
const SIGNED_URL_TTL_SECONDS = 300;
const PREVIEW_BUCKET = "sd-admin-previews";
const GITHUB_REPO = "Edward11031709/Starry-Dreamland";
const MAX_FILES = 600;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;
const SKIP_TOP_LEVEL = new Set([
  ".git", ".github", "docs", "supabase", "tests", "test",
  "node_modules", "coverage"
]);

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".wasm": "application/wasm",
  ".hdr": "application/octet-stream",
  ".ktx2": "image/ktx2"
};

function corsHeaders(origin: string | null) {
  const allowed = (Deno.env.get("ADMIN_PREVIEW_ALLOWED_ORIGINS") ?? DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",").map((value) => value.trim()).filter(Boolean);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
  if (origin && allowed.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function jsonResponse(status: number, payload: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8" }
  });
}

function getEnvironmentKey(primary: string, fallback: string, mapName: string): string | undefined {
  let value = Deno.env.get(primary) ?? Deno.env.get(fallback);
  if (value) return value;
  try {
    const configured = JSON.parse(Deno.env.get(mapName) ?? "{}");
    value = configured.default ?? Object.values(configured)[0];
  } catch {
    value = undefined;
  }
  return typeof value === "string" ? value : undefined;
}

function isAllowedRepositoryPath(path: string): boolean {
  if (!isSafePreviewPath(path)) return false;
  const firstSegment = path.split("/")[0];
  if (SKIP_TOP_LEVEL.has(firstSegment)) return false;
  return true;
}

async function importCommitToPrivateStorage(
  storageClient: ReturnType<typeof createClient>,
  commitSha: string
): Promise<{ filesUploaded: number; totalBytes: number }> {
  const treeUrl = `https://api.github.com/repos/${GITHUB_REPO}/git/trees/${commitSha}?recursive=1`;
  const treeResponse = await fetch(treeUrl, {
    headers: {
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "StarryDreamlandAdminPreview/1.0"
    }
  });
  if (!treeResponse.ok) {
    throw new Error(`無法從 GitHub 讀取指定版本（HTTP ${treeResponse.status}）。`);
  }

  const treeData = await treeResponse.json();
  if (treeData.truncated === true || !Array.isArray(treeData.tree)) {
    throw new Error("GitHub 版本檔案清單不完整，已中止匯入。");
  }

  const files = treeData.tree.filter((item: { path?: string; type?: string; size?: number }) =>
    item.type === "blob" &&
    typeof item.path === "string" &&
    isAllowedRepositoryPath(item.path)
  ).map((item: { path: string; size?: number }) => ({
    path: item.path,
    size: Number.isFinite(item.size) ? Number(item.size) : 0,
    extension: `.${item.path.split(".").pop()?.toLowerCase() ?? ""}`
  }));

  if (files.length === 0 || files.length > MAX_FILES) {
    throw new Error("候選版本的靜態檔案數量不合理，已中止匯入。");
  }
  if (!files.some((file: { path: string }) => file.path === "index.html")) {
    throw new Error("候選版本缺少 index.html，無法建立網站預覽。");
  }

  const expectedBytes = files.reduce((sum: number, file: { size: number }) => sum + file.size, 0);
  if (expectedBytes > MAX_TOTAL_BYTES) {
    throw new Error("候選版本靜態檔案超過 80 MB，已中止匯入。");
  }

  let uploaded = 0;
  let actualBytes = 0;
  const batchSize = 8;
  for (let offset = 0; offset < files.length; offset += batchSize) {
    const batch = files.slice(offset, offset + batchSize);
    const results = await Promise.all(batch.map(async (file: { path: string; size: number; extension: string }) => {
      const encodedPath = file.path.split("/").map(encodeURIComponent).join("/");
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${commitSha}/${encodedPath}`;
      const response = await fetch(rawUrl, {
        headers: { "User-Agent": "StarryDreamlandAdminPreview/1.0" }
      });
      if (!response.ok) {
        throw new Error(`無法下載候選檔案 ${file.path}（HTTP ${response.status}）。`);
      }
      const body = new Uint8Array(await response.arrayBuffer());
      if (file.size > 0 && body.byteLength !== file.size) {
        throw new Error(`候選檔案大小驗證失敗：${file.path}。`);
      }
      const objectPath = `releases/${commitSha}/${file.path}`;
      const { error } = await storageClient.storage.from(PREVIEW_BUCKET).upload(objectPath, body, {
        contentType: MIME_TYPES[file.extension] ?? "application/octet-stream",
        cacheControl: "0",
        upsert: true
      });
      if (error) throw new Error(`私有儲存上傳失敗：${file.path}。`);
      return body.byteLength;
    }));

    uploaded += results.length;
    actualBytes += results.reduce((sum, size) => sum + size, 0);
    if (actualBytes > MAX_TOTAL_BYTES) {
      throw new Error("候選版本實際下載量超過 80 MB，已中止匯入。");
    }
  }

  return { filesUploaded: uploaded, totalBytes: actualBytes };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);
  const allowed = (Deno.env.get("ADMIN_PREVIEW_ALLOWED_ORIGINS") ?? DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",").map((value) => value.trim()).filter(Boolean);

  if (origin && !allowed.includes(origin)) {
    return jsonResponse(403, { error: "Preview origin is not allowed." }, origin);
  }
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return jsonResponse(405, { error: "Method not allowed." }, origin);

  const authorization = request.headers.get("authorization") ?? "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return jsonResponse(401, { error: "Sign in is required." }, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = getEnvironmentKey(
    "SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEYS"
  );
  const privilegedKey = getEnvironmentKey(
    "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "SUPABASE_SECRET_KEYS"
  );
  if (!supabaseUrl || !publishableKey || !privilegedKey) {
    return jsonResponse(503, { error: "Private preview service is not configured." }, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." }, origin);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse(400, { error: "A JSON object is required." }, origin);
  }

  const action = body.action === "import" ? "import" : "sign";
  const commitSha = body.commit_sha;
  const path = body.path;
  if (typeof commitSha !== "string" || !/^[a-f0-9]{40}$/.test(commitSha)) {
    return jsonResponse(400, { error: "A full 40-character commit SHA is required." }, origin);
  }
  if (action === "sign" && !isSafePreviewPath(path)) {
    return jsonResponse(400, { error: "Preview file path is invalid or not permitted." }, origin);
  }

  try {
    const userClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${tokenMatch[1]}` } }
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(tokenMatch[1]);
    if (userError || !userData.user) {
      return jsonResponse(401, { error: "The sign-in session is invalid or expired." }, origin);
    }

    const { data: isAdmin, error: adminError } = await userClient.rpc("sd_is_admin");
    if (adminError) {
      return jsonResponse(503, { error: "Administrator verification is unavailable." }, origin);
    }
    if (isAdmin !== true) {
      return jsonResponse(403, { error: "Administrator access is required." }, origin);
    }

    const storageClient = createClient(supabaseUrl, privilegedKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    if (action === "import") {
      const imported = await importCommitToPrivateStorage(storageClient, commitSha);
      return jsonResponse(200, {
        ok: true,
        commitSha,
        filesUploaded: imported.filesUploaded,
        totalBytes: imported.totalBytes,
        message: "候選版本已匯入 Supabase 私有預覽區。"
      }, origin);
    }

    const objectPath = `releases/${commitSha}/${path}`;
    const { data, error } = await storageClient.storage.from(PREVIEW_BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      return jsonResponse(404, { error: "The requested preview file is not available." }, origin);
    }

    return jsonResponse(200, {
      signedUrl: data.signedUrl,
      commitSha,
      path,
      expiresIn: SIGNED_URL_TTL_SECONDS
    }, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process the private preview request.";
    return jsonResponse(500, { error: message }, origin);
  }
});
