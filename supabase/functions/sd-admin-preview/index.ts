import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const DEFAULT_ALLOWED_ORIGINS = ["https://edward11031709.github.io"];
const ALLOWED_EXTENSIONS = new Set([
  "html", "js", "css", "json", "png", "jpg", "jpeg", "webp", "svg", "ico",
  "woff", "woff2", "ttf", "otf", "glb", "gltf", "bin", "mp3", "ogg", "wav",
  "mp4", "webm", "wasm", "hdr", "ktx2"
]);
const SIGNED_URL_TTL_SECONDS = 300;

function corsHeaders(origin) {
  const allowed = (Deno.env.get("ADMIN_PREVIEW_ALLOWED_ORIGINS") ?? DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",").map((value) => value.trim()).filter(Boolean);
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
  if (origin && allowed.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function jsonResponse(status, payload, origin) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8" }
  });
}

function isSafePreviewPath(value) {
  if (typeof value !== "string" || value.length < 1 || value.length > 240) return false;
  if (value.startsWith("/") || value.includes("\\") || value.includes("?") || value.includes("#")) return false;
  if (!/^[A-Za-z0-9._/-]+$/.test(value)) return false;
  const segments = value.split("/");
  if (segments.length > 10 || segments.some((part) => !part || part === "." || part === ".." || part.startsWith("."))) return false;
  const extension = value.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.has(extension);
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
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const privilegedKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");
  const bucket = Deno.env.get("ADMIN_PREVIEW_BUCKET") ?? "sd-admin-previews";
  if (!supabaseUrl || !publishableKey || !privilegedKey) {
    return jsonResponse(503, { error: "Private preview service is not configured." }, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." }, origin);
  }

  const commitSha = body.commit_sha;
  const path = body.path;
  if (typeof commitSha !== "string" || !/^[a-f0-9]{40}$/.test(commitSha)) {
    return jsonResponse(400, { error: "A full 40-character commit SHA is required." }, origin);
  }
  if (!isSafePreviewPath(path)) {
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
    const objectPath = `releases/${commitSha}/${path}`;
    const { data, error } = await storageClient.storage.from(bucket)
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
  } catch {
    return jsonResponse(500, { error: "Unable to create the private preview link." }, origin);
  }
});
