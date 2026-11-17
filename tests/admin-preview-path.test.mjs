import test from "node:test";
import assert from "node:assert/strict";
import { isSafePreviewPath } from "../supabase/functions/_shared/preview-path.mjs";

test("allows required static website assets", () => {
  for (const path of ["index.html", "config.js", "js/starry-3d.js", "assets/park.glb", "fonts/dream.woff2"]) {
    assert.equal(isSafePreviewPath(path), true, path);
  }
});

test("rejects traversal, absolute paths, hidden files, and encoded paths", () => {
  for (const path of ["../index.html", "/index.html", ".env", "js/.secret.js", "js/%2e%2e/file.js", "js\\\\secret.js", "bad.exe", "js//file.js", ""]) {
    assert.equal(isSafePreviewPath(path), false, String(path));
  }
});

test("rejects non-string and excessive-depth paths", () => {
  assert.equal(isSafePreviewPath(null), false);
  assert.equal(isSafePreviewPath(["index.html"]), false);
  assert.equal(isSafePreviewPath(Array(11).fill("a").join("/") + ".js"), false);
});
