import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, "missing section start: " + startMarker);
  assert.notEqual(end, -1, "missing section end: " + endMarker);
  return source.slice(start, end);
}

test("premium hand-painted GLB materials receive a shared cel-shading ramp", () => {
  const materials = section("function tunePremiumMaterials(root){", "function findPremiumRideSeatNode(");
  assert.match(materials, /new THREE\.DataTexture\(/);
  assert.match(materials, /toonGradient\.magFilter=THREE\.NearestFilter/);
  assert.match(materials, /new THREE\.MeshToonMaterial\(/);
  assert.match(materials, /gradientMap:toonGradient/);
  assert.match(materials, /const materialCache=new Map\(\)/);
  assert.match(materials, /materialCache\.has\(material\)/);
  assert.match(materials, /materialCache\.set\(material,refined\)/);
});

test("transparent, transmissive and reflective surfaces keep their PBR response", () => {
  const materials = section("function tunePremiumMaterials(root){", "function findPremiumRideSeatNode(");
  assert.match(materials, /material\.transparent===true/);
  assert.match(materials, /material\.transmission/);
  assert.match(materials, /material\.metalness/);
  assert.match(materials, /material\.roughness/);
  assert.match(materials, /refined=material\.clone\(\)/);
});

test("toon shading preserves hand-painted maps and normal detail on compatible surfaces", () => {
  const materials = section("function tunePremiumMaterials(root){", "function findPremiumRideSeatNode(");
  assert.match(materials, /map:material\.map\|\|null/);
  assert.match(materials, /normalMap:material\.normalMap\|\|null/);
  assert.match(materials, /emissiveMap:material\.emissiveMap\|\|null/);
  assert.match(materials, /aoMap:material\.aoMap\|\|null/);
  assert.match(materials, /transparent:material\.transparent\|\|false/);
});

test("player avatars share the same cel-shaded art direction and keep silhouette contours", () => {
  const avatar = section("function buildPlayer(", "\n\n\nfunction mount(");
  assert.match(avatar, /new THREE\.MeshToonMaterial\(/);
  assert.match(avatar, /gradientMap:toonGradient/);
  assert.match(avatar, /const toonMaterialCache=new Map\(\)/);
  assert.match(avatar, /StarryAnimeSilhouette/);
  assert.match(avatar, /animeOutlineCount/);
  assert.match(avatar, /faceLashCount/);
});
