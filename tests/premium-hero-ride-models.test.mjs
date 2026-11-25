import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source=readFileSync(new URL("../js/starry-3d.js",import.meta.url),"utf8");

function section(startMarker,endMarker){
  const start=source.indexOf(startMarker);
  const end=source.indexOf(endMarker,start);
  assert.notEqual(start,-1,"missing section start: "+startMarker);
  assert.notEqual(end,-1,"missing section end: "+endMarker);
  return source.slice(start,end);
}
function assetLine(id){
  const line=source.split("\n").find(row=>row.includes('id:"'+id+'"'));
  assert.ok(line,"missing asset config: "+id);
  return line;
}

const assets=section("const PREMIUM_PARK_ASSETS = [","function sha256Hex(");
const controller=section("function createPremiumAssetController(","function attachPremiumRideSign(");
const mount=section("function mountPremiumAsset(","async function loadPremiumParkAssets(");
const loader=section("async function loadPremiumParkAssets(","const gameMeta =");
const hider=section("function hideProceduralRideMeshes(","function applyPremiumRideFootprint(");
const collision=section("function blockedAt(x,z) {","world.onAvatarChange = event");

test("the main castle is replaced by the detailed Castle Keep with pinned LODs and integrity hashes",()=>{
  const castle=assetLine("castle-keep");
  assert.ok(castle.includes("https://tevy.dev/models/castle-keep/v2/lod0.glb"));
  assert.ok(castle.includes("https://tevy.dev/models/castle-keep/v2/lod1.glb"));
  assert.ok(castle.includes("e28e3d31fd547cafc484e453d384f30554d82c55bd98535308b4c844ac8411e0"));
  assert.ok(castle.includes("8dea85a015a2d60c05709357174504b59c858fb79fa4050301771591a77b9f2f"));
  assert.ok(castle.includes("height:17.2"));
  assert.ok(castle.includes('motionType:"castle-portcullis"'));
});

test("the carousel uses its detailed CC0 model and all moving platform, canopy and seat pivots",()=>{
  const carousel=assetLine("carousel");
  assert.ok(carousel.includes("https://tevy.dev/models/carousel/v2/lod0.glb"));
  assert.ok(carousel.includes("https://tevy.dev/models/carousel/v2/lod1.glb"));
  assert.ok(carousel.includes("7f994df1c5050176e162699f3122b36df61aa725eead55e24e1b6d7682cdb7af"));
  assert.ok(carousel.includes("8ffb404031aec922f7d4e5afd316172f1ce5ce0b75c3dce820fe200e5f28070a"));
  assert.ok(carousel.includes('motionType:"carousel"'));
  assert.ok(carousel.includes('seatNodeHints:["seat_outer_01"]'));
  assert.match(controller,/findPremiumNode\(model,"platform"\)/);
  assert.match(controller,/findPremiumNode\(model,"canopy"\)/);
  assert.match(controller,/for\(const ring of \["outer","inner"\]\)/);
  assert.match(controller,/index<=12/);
  assert.match(controller,/pivot\.attach\(node\)/);
  assert.match(controller,/pivot\.rotation\.y\+=delta\*0\.19/);
});

test("the Ferris wheel uses 24 authored gondola pivots and keeps cabins level during rotation",()=>{
  const ferris=assetLine("ferris-wheel");
  assert.ok(ferris.includes("https://tevy.dev/models/ferris-wheel/v2/lod0.glb"));
  assert.ok(ferris.includes("https://tevy.dev/models/ferris-wheel/v2/lod1.glb"));
  assert.ok(ferris.includes("b1353fb1db47c37e2d131a9cf1884d7454efbeb1788b073944c4722934fc074e"));
  assert.ok(ferris.includes("aca5c70c95ec102f5cf0fd833acf1f6b908a29b7a94cbc08408039bb78c09059"));
  assert.ok(ferris.includes("height:20.5"));
  assert.ok(ferris.includes('motionType:"ferris-wheel"'));
  assert.match(controller,/for\(let index=1;index<=24;index\+\+\)/);
  assert.match(controller,/wheel\.rotation\.z=wheelBase\+angle/);
  assert.match(controller,/node\.rotation\.z=gondolaBases\[index\]-angle/);
});

test("the Castle Keep portcullis moves with a smooth open, hold and close cycle",()=>{
  assert.match(controller,/findPremiumNode\(model,"portcullis"\)/);
  assert.match(controller,/const phase=elapsed%22/);
  assert.match(controller,/THREE\.MathUtils\.smoothstep/);
  assert.match(controller,/gate\.position\.y=closedY\+lift\*3\.5/);
});

test("manual controllers are checked before a procedural ride or castle fallback is hidden",()=>{
  assert.ok(mount.indexOf("const controller=createPremiumAssetController(model,config)")<mount.indexOf("hideProceduralRideMeshes(ride.root)"));
  assert.ok(mount.indexOf("const controller=createPremiumAssetController(model,config)")<mount.indexOf("if(fallback)fallback.visible=false"));
  assert.match(mount,/if\(controller\)world\.assetControllers\.push\(controller\)/);
  assert.match(loader,/catch\(error\)[\s\S]*?starry-3d-asset-fallback/);
});

test("the ride's existing passenger anchor and new station sign are kept",()=>{
  assert.match(mount,/const seat=attachPremiumRideSeat\(model,config\)/);
  assert.match(mount,/ride\.rideSeat=seat/);
  assert.match(mount,/attachPremiumRideSign\(ride,config\)/);
  assert.match(hider,/child\.isSprite/);
});

test("desktop loads full LOD0, compact screens load LOD1 and the pinned hashes are checked",()=>{
  assert.match(loader,/const lod=viewportWidth<=1024&&config\.mobileUrl\?1:0/);
  assert.match(loader,/const assetUrl=lod===1\?config\.mobileUrl:config\.url/);
  assert.match(loader,/const expectedHash=lod===1\?config\.sha256Lod1:config\.sha256Lod0/);
  assert.match(loader,/sha256!==expectedHash/);
  assert.match(loader,/detail:\{id:config\.id,sha256,bytes,lod\}/);
});

test("the new ride palette harmonizes saturated colours without replacing authored textures",()=>{
  assert.ok(assetLine("carousel").includes('themeGrade:"starry-rides"'));
  assert.ok(assetLine("ferris-wheel").includes('themeGrade:"starry-rides"'));
  assert.match(source,/function harmonizePremiumRidePalette\(root\)/);
  assert.match(source,/material\.color\.lerp\(target\.color,0\.26\)/);
  assert.match(source,/if\(config\.themeGrade==="starry-rides"\)harmonizePremiumRidePalette\(model\)/);
});

test("the upgraded castle has a broad rectangular collider with a clear front doorway",()=>{
  assert.match(source,/halfWidth:10\.2,halfDepth:7\.7/);
  assert.match(source,/entryGapHalfWidth:2\.6,entryGapDepth:1\.8/);
  assert.match(collision,/const doorway=Number\.isFinite\(collider\.entryGapHalfWidth\)/);
  assert.match(collision,/return inside&&!doorway/);
  assert.ok(source.includes("addContactShadow(0,-18.2,22.4,17.4,0.79)"));
});

test("the per-frame loop advances all manual premium asset controllers",()=>{
  assert.match(source,/assetMixers:\[\], assetControllers:\[\]/);
  assert.match(source,/world\.assetControllers\.forEach\(controller=>controller\.update\(delta\)\)/);
});
