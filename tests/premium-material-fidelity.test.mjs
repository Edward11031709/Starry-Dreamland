import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
const start = source.indexOf("function tunePremiumMaterials(root){");
const end = source.indexOf("function findPremiumRideSeatNode(root,config){", start);
assert.notEqual(start, -1, "missing premium material tuner");
assert.notEqual(end, -1, "missing premium material tuner boundary");
const tuner = source.slice(start, end);

test("textured GLB surfaces keep every authored PBR texture channel", () => {
  for (const key of [
    "map",
    "normalMap",
    "roughnessMap",
    "metalnessMap",
    "bumpMap",
    "displacementMap",
    "aoMap",
    "emissiveMap",
    "lightMap",
    "alphaMap"
  ]) {
    assert.ok(tuner.includes('"' + key + '"'), "missing PBR texture channel: " + key);
  }
  assert.match(tuner, /const hasSurfaceTexture=surfaceTextureKeys\.some\(key=>Boolean\(material\[key\]\)\)/);
  assert.match(tuner, /refined=material\.clone\(\)/);
});

test("textured surfaces retain roughness and metalness maps instead of being flattened into toon materials", () => {
  assert.match(tuner, /const preservePhysical=\s*hasSurfaceTexture\|\|/);
  assert.match(tuner, /if\("roughness" in refined&&!refined\.roughnessMap\)/);
  assert.match(tuner, /if\("metalness" in refined&&!refined\.metalnessMap\)/);
  assert.match(tuner, /refined\.name=\(material\.name\|\|"StarryPremiumSurface"\)\+"_StarryPBR"/);
});

test("simple untextured surfaces still use the shared anime toon ramp", () => {
  assert.match(tuner, /if\(preservePhysical\)\{[\s\S]*?\}else\{/);
  assert.match(tuner, /new THREE\.MeshToonMaterial\(/);
  assert.match(tuner, /gradientMap:toonGradient/);
  assert.match(tuner, /refined\.name="StarryPremiumAnimeToonMaterial"/);
});

test("transparent, transmission, high-metal and clearcoat materials remain physically based", () => {
  assert.match(tuner, /material\.transparent===true/);
  assert.match(tuner, /\(material\.transmission\?\?0\)>0\.015/);
  assert.match(tuner, /\(material\.metalness\?\?0\)>0\.62/);
  assert.match(tuner, /\(material\.clearcoat\?\?0\)>0\.12/);
});

test("material reuse remains cached across imported mesh nodes", () => {
  assert.match(tuner, /const materialCache=new Map\(\)/);
  assert.match(tuner, /if\(materialCache\.has\(material\)\)return materialCache\.get\(material\)/);
  assert.match(tuner, /materialCache\.set\(material,refined\)/);
});
