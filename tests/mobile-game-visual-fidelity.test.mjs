import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, "missing section start: " + startMarker);
  assert.notEqual(end, -1, "missing section end: " + endMarker);
  return source.slice(start, end);
}

test("architectural materials use independent albedo, normal and roughness maps", () => {
  const maps = section("function createPbrSurfaceMaps(", "function applyPattern(");
  const apply = section("function applyPattern(", "function createReflectionEnvironment(");
  assert.match(maps, /new THREE\.DataTexture\(normalData,size,size,THREE\.RGBAFormat\)/);
  assert.match(maps, /new THREE\.DataTexture\(roughData,size,size,THREE\.RGBAFormat\)/);
  assert.match(maps, /normalData\[i\+2\]/);
  assert.match(maps, /roughBase=kind==="roof"\?0\.58:kind==="paving"\?0\.83:kind==="wood"\?0\.72:0\.88/);
  assert.match(apply, /material\.normalMap=maps\.normalMap/);
  assert.match(apply, /material\.roughnessMap=maps\.roughnessMap/);
  assert.match(apply, /material\.bumpMap=null/);
});

test("reflection lighting is baked through PMREM and stored on the scene", () => {
  const environment = section("function createReflectionEnvironment(", "function createCinematicPostFX(");
  assert.match(environment, /THREE\.EquirectangularReflectionMapping/);
  assert.match(environment, /new THREE\.PMREMGenerator\(renderer\)/);
  assert.match(environment, /generator\.fromEquirectangular\(source\)/);
  assert.match(environment, /scene\.environment=target\.texture/);
  assert.match(environment, /scene\.environmentIntensity=0\.72/);
  assert.match(environment, /generator\?\.dispose\(\)/);
});

test("selective highlight glow has a mobile quality tier and standard-render fallback", () => {
  const post = section("function createCinematicPostFX(", "function makeMaterial(");
  assert.match(post, /const scale=isSmall\?0\.78:1/);
  assert.match(post, /new THREE\.WebGLRenderTarget/);
  assert.match(post, /brightSample/);
  assert.match(post, /bloomStrength:\{value:isSmall\?0\.28:0\.38\}/);
  assert.match(post, /renderer\.toneMapping=THREE\.NoToneMapping/);
  assert.match(post, /post-processing failed; using standard renderer/);
  assert.match(post, /renderer\.render\(scene,camera\);return false/);
});

test("world disposal releases post-processing and reflection render targets", () => {
  const disposal = section("function disposeWorld(", "function buildPlayer(");
  assert.match(disposal, /world\.postFX\?\.dispose\(\)/);
  assert.match(disposal, /world\.reflectionTarget\?\.dispose\(\)/);
});

test("scene render and resize both use the mobile-aware post-processing target", () => {
  const mount = section("function mount(host)", "const avatarPreviews=");
  assert.match(mount, /createReflectionEnvironment\(renderer,scene\)/);
  assert.match(mount, /createCinematicPostFX\(renderer,width,height,isSmall\)/);
  assert.match(mount, /if\(postFX\)postFX\.render\(scene,camera\)/);
  assert.match(mount, /postFX\?\.setSize\(w,h,renderer\.getPixelRatio\(\)\)/);
});

test("hero structures receive soft contact shadows instead of extra point lights", () => {
  const environment = section("function buildEnvironment(", "function createParkMotes(");
  assert.match(environment, /SoftContactShadow/);
  assert.match(environment, /new THREE\.MeshBasicMaterial\(\{\s*map:shadowTexture/);
  assert.match(environment, /addContactShadow\(0,-18\.2,13\.2,12\.4,0\.79\)/);
  assert.match(environment, /addContactShadow\(-30,-16\.5,9\.2,8\.5,0\.895\)/);
  assert.match(environment, /addContactShadow\(-4\.8,30\.5,6\.2,5\.4,0\.79\)/);
});

test("path lanterns keep emissive glow but cap local real-time lights to one in five", () => {
  const environment = section("function buildEnvironment(", "function createParkMotes(");
  const lamps = section("function addParkLamp(", "  [\n    [-4,25]");
  assert.match(lamps, /function addParkLamp\(x,z,scale=1,hasLocalLight=false\)/);
  assert.match(lamps, /if\(hasLocalLight\)\{const glow=new THREE\.PointLight/);
  assert.match(environment, /addParkLamp\(p\[0\],p\[1\],i%4===0\?1\.12:1,i%5===0\)/);
});

test("premium asset catalog covers all four visual batches without adding crowd actors", () => {
  assert.match(source,/const PREMIUM_PARK_ASSETS = \[/);
  for(const id of ["castle-cathedral","arcane-observatory","carousel","teacups","drop-tower","ferris-wheel","coaster-train","crystal-willow","glowing-crystal-cluster"])assert.match(source,new RegExp('id:"'+id+'"'));
  assert.match(source,/batch:1/);assert.match(source,/batch:2/);assert.match(source,/batch:3/);\n  assert.match(source,/const PREMIUM_AVATAR_DETAIL_BATCH = 4/);
  assert.doesNotMatch(source,/townsfolk|fakeNpc|spawnNpc/i);
});

test("premium GLB loading computes SHA-256 and keeps procedural fallbacks on failure", () => {
  assert.match(source,/crypto\.subtle\.digest\("SHA-256",buffer\)/);
  assert.match(source,/async function loadPremiumGlb\(url\)/);
  assert.match(source,/starry-3d-asset-fallback/);
  assert.match(source,/if\(fallback\)fallback\.visible=false/);
  assert.match(source,/loadPremiumParkAssets\(world\)/);
});

test("GLTFLoader uses the exact pinned Three.js release via import map", () => {
  assert.match(source,/three@0\.187\.0\/examples\/jsm\/loaders\/GLTFLoader\.js/);
  assert.match(html,/"three":"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.187\.0\/build\/three\.module\.js"/);
  assert.match(html,/"three\/addons\/":"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.187\.0\/examples\/jsm\/"/);
});

test("premium ride mixers update while existing interaction anchors remain in place", () => {
  assert.match(source,/world\.assetMixers\.forEach\(mixer=>mixer\.update\(delta\)\)/);
  assert.match(source,/ride\.root\.children\.forEach\(child=>child\.visible=false\)/);
  assert.match(source,/ride\.object=model/);
});
