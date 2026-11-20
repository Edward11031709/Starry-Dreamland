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

test("administrator navigation is granted only by the verified database role", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /sb\.rpc\("sd_is_admin"\)/);
  assert.match(html, /isAdmin:isAdmin===true/);
  assert.match(html, /if\(p\?\.isAdmin&&navRoot&&!adminButton\)/);
  assert.match(html, /else if\(!p\?\.isAdmin&&adminButton\)adminButton\.remove\(\)/);
  assert.match(html, /if\(!me\(\)\?\.isAdmin\|\|!cloudUser\|\|!sb\)/);
  assert.doesNotMatch(html, /<button[^>]+data-page=["']admin["']/i,
    "administrator navigation must not be statically exposed to visitors");
});

test("drop tower geometry uses structural braces and sculpted open seats", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  const start = source.indexOf("function buildDropTower(");
  const end = source.indexOf("\nfunction ", start + 1);
  assert.notEqual(start, -1, "drop tower builder exists");
  const builder = source.slice(start, end === -1 ? undefined : end);
  assert.match(builder, /const addBrace=/);
  assert.match(builder, /new THREE\.CylinderGeometry\(radius\*0\.78,radius,direction\.length\(\),9\)/);
  assert.match(builder, /const seatProfile=/);
  assert.match(builder, /new THREE\.LatheGeometry\(seatProfile,24\)/);
  assert.match(builder, /id:"drop",name:"星際自由落體"/);
});


test("private preview import is admin-gated and does not require GitHub Actions secrets", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const workflow = readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  const fn = readFileSync(new URL("../supabase/functions/sd-admin-preview/index.ts", import.meta.url), "utf8");
  assert.ok(html.includes('body:{action:"import",commit_sha:sha}'));
  assert.ok(fn.includes("sd_is_admin"));
  assert.ok(fn.includes("const GITHUB_REPO = \"Edward11031709/Starry-Dreamland\""));
  assert.ok(fn.includes("git/trees/${commitSha}?recursive=1"));
  assert.ok(fn.includes("https://raw.githubusercontent.com/"));
  assert.ok(fn.includes("MAX_FILES = 600"));
  assert.ok(fn.includes("MAX_TOTAL_BYTES = 80 * 1024 * 1024"));
  assert.doesNotMatch(workflow, /SUPABASE_SERVICE_ROLE_KEY|publish_private_preview|preview_commit_sha/);
  assert.ok(html.includes('sandbox="allow-scripts allow-forms allow-pointer-lock"'));
  assert.ok(html.includes("隔離預覽不會更新公開網站"));
  assert.doesNotMatch(html, /sandbox="[^"]*allow-same-origin/);
});


test("central promenade rest gardens use carved seats, crystal planters, and walkable-height pads", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  const start = source.indexOf("function addPromenadeRestNook(");
  const end = source.indexOf("function addOrnamentalArch(", start);
  assert.notEqual(start, -1, "promenade rest nook builder exists");
  assert.ok(end > start, "rest nook builder has a clear boundary");
  const builder = source.slice(start, end);
  assert.ok(builder.includes("new THREE.ExtrudeGeometry(backrestShape"));
  assert.ok(builder.includes("new THREE.TubeGeometry(backCurve"));
  assert.ok(builder.includes("new THREE.CatmullRomCurve3("));
  assert.ok(builder.includes("addCrystal(bowl"));
  assert.ok(builder.includes("terrainZones.push({x,z,radius:2.3,surfaceY:0.82})"));
  assert.ok(builder.includes('addCollider(x,z,1.75,"星夢休憩長椅")'));
  assert.equal(builder.includes("new THREE.PointLight"), false, "rest nodes must not add real-time lights");
  assert.ok(source.includes("addPromenadeRestNook(-12,23.2,Math.PI/2,PALETTE.violet)"));
  assert.ok(source.includes("addPromenadeRestNook(12,23.2,-Math.PI/2,PALETTE.blue)"));
});

test("promenade rest nook does not generate placeholder bystanders", () => {
  const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
  const start = source.indexOf("function addPromenadeRestNook(");
  const end = source.indexOf("function addOrnamentalArch(", start);
  const builder = source.slice(start, end);
  assert.equal(builder.includes("spawnNpc("), false);
  assert.equal(builder.includes("addNPC("), false);
  assert.equal(builder.includes("createPlayer("), false);
});
