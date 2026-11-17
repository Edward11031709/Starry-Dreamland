import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("avatar couture materials are initialized before hem geometry uses them", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  const start = source.indexOf("function buildPlayer(");
  const end = source.indexOf("\nfunction ", start + 1);
  assert.notEqual(start, -1, "buildPlayer function exists");
  const buildPlayer = source.slice(start, end === -1 ? undefined : end);
  const declaration = buildPlayer.indexOf("const coutureGold=");
  const hem = buildPlayer.indexOf("// Double-layered metallic hem");
  assert.notEqual(declaration, -1, "couture materials are declared");
  assert.notEqual(hem, -1, "hem details are present");
  assert.ok(declaration < hem, "materials must exist before hem geometry is created");
});

test("avatar robe profiles flare toward the hem", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  const start = source.indexOf("function buildPlayer(");
  const end = source.indexOf("\nfunction ", start + 1);
  const buildPlayer = source.slice(start, end === -1 ? undefined : end);
  const profile = buildPlayer.match(/const robeProfile=\[([\s\S]*?)\];/);
  assert.ok(profile, "robe profile exists");
  const radii = profile[1].split("new THREE.Vector2(").slice(1).map(point => Number(point.split(",")[0]));
  assert.ok(radii.length >= 4, "robe profile contains enough contour points");
  assert.ok(radii[0] > radii[radii.length - 1], "hem should be wider than the waist");
});

test("avatar face and hair use a proportion-adjusted head rig", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  const start = source.indexOf("function buildPlayer(");
  const end = source.indexOf("\nfunction ", start + 1);
  const buildPlayer = source.slice(start, end === -1 ? undefined : end);
  assert.match(buildPlayer, /const headScale=0\.86;/);
  assert.match(buildPlayer, /const headRig=new THREE\.Group\(\);/);
  const headStart = buildPlayer.indexOf("// A visible neck and jeweled collar");
  const headEnd = buildPlayer.indexOf("// Traveler archetype controls the silhouette");
  assert.ok(headStart >= 0 && headEnd > headStart, "head rig block is present");
  assert.equal(buildPlayer.slice(headStart, headEnd).includes("addMesh(player,"), false,
    "facial features and hair must stay inside the scaled rig");
});

test("castle lancet windows and carousel horses use sculpted geometry", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  assert.match(source, /function makeLancetGeometry\(/);
  assert.match(source, /new THREE\.ShapeGeometry\(shape,24\)/);
  assert.match(source, /const maneCurve=new THREE\.CatmullRomCurve3\(/);
  assert.match(source, /const tailCurve=new THREE\.CatmullRomCurve3\(/);
  assert.match(source, /const saddlePiping=addMesh\(horse/);
});

test("Ferris wheel cabins use rounded shells and arched glass", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  assert.match(source, /const cabinGeometry=new THREE\.ExtrudeGeometry/);
  assert.match(source, /makeLancetGeometry\(0\.325,0\.35\),cabinGlass/);
  assert.match(source, /const canopy=addMesh\(gondola,new THREE\.SphereGeometry/);
});
