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

const assetConfigs = section("const PREMIUM_PARK_ASSETS = [", "function sha256Hex(");
const seatHelpers = section("function findPremiumRideSeatNode(", "function mountPremiumAsset(");
const mount = section("function mountPremiumAsset(", "async function loadPremiumParkAssets(");
const rideBranch = section("if(config.rideId){", "if(config.target){");
const rideLoop = section("environment.rides.forEach(ride => {", "world.assetMixers.forEach(mixer=>mixer.update(delta))");

test("premium ride assets declare semantic passenger nodes and matching ride footprints", () => {
  for (const [id, hint] of [
    ["carousel", "horse"],
    ["teacups", "cup"],
    ["drop-tower", "gondola"],
    ["ferris-wheel", "gondola"]
  ]) {
    assert.match(assetConfigs, new RegExp('id:"' + id + '"[^\\n]*seatNodeHints:\\['));
    assert.match(assetConfigs, new RegExp('id:"' + id + '"[^\\n]*seatNodeHints:\\[[^\\]]*"' + hint + '"'));
  }
  assert.match(assetConfigs, /id:"ferris-wheel"[^\\n]*parentScale:1[^\\n]*colliderRadius:7\.4/);
});

test("ride anchors are attached to named GLB nodes and positioned from their measured bounds", () => {
  assert.match(seatHelpers, /function findPremiumRideSeatNode/);
  assert.match(seatHelpers, /new THREE\.Box3\(\)\.setFromObject\(node\)/);
  assert.match(seatHelpers, /seatWorld\.applyMatrix4\(inverse\)/);
  assert.match(seatHelpers, /node\.add\(anchor\)/);
  assert.match(seatHelpers, /StarryPremiumRideSeatAnchor/);
});

test("a premium ride cannot hide its playable fallback before seat and animation validation", () => {
  assert.ok(rideBranch.indexOf("attachPremiumRideSeat(model,config)") >= 0);
  assert.ok(rideBranch.indexOf("createPremiumAssetMixer(model,gltf,config)") >= 0);
  assert.ok(rideBranch.indexOf("attachPremiumRideSeat(model,config)") < rideBranch.indexOf("hideProceduralRideMeshes(ride.root)"));
  assert.ok(rideBranch.indexOf("createPremiumAssetMixer(model,gltf,config)") < rideBranch.indexOf("hideProceduralRideMeshes(ride.root)"));
  assert.match(rideBranch, /ride\.rideSeat=seat/);
  assert.match(rideBranch, /ride\.axis="asset"/);
});

test("teacups play both independent motion clips and the drop tower cycles its lift animation", () => {
  assert.match(assetConfigs, /id:"teacups"[^\\n]*animations:\["platform-spin","cup-spin"\][^\\n]*requireAnimations:true/);
  assert.match(assetConfigs, /id:"drop-tower"[^\\n]*animation:"open",pingPong:true[^\\n]*requireAnimations:true/);
  assert.match(mount, /config\.pingPong\)action\.setLoop\(THREE\.LoopPingPong,Infinity\)/);
});

test("GLB ride animation is not double-applied by the procedural ride loop", () => {
  assert.match(rideLoop, /else if\(ride\.axis!=="asset"\) ride\.object\.rotation\.z/);
  assert.match(mount, /ride\.axis="asset"/);
  assert.match(mount, /world\.assetMixers\.push\(mixer\)/);
});

test("all static placements preserve the model's ground-contact offset", () => {
  assert.match(mount, /const groundOffset=-bounds\.min\.y\*scale/);
  assert.match(mount, /0\.68\+groundOffset/);
  assert.match(mount, /y\+groundOffset/);
  assert.match(mount, /config\.position\[1\]\+groundOffset/);
});

test("premium ride collision footprints and dismount distances follow the imported model scale", () => {
  assert.match(mount, /function applyPremiumRideFootprint/);
  assert.match(mount, /collider\.radius=config\.colliderRadius/);
  assert.match(mount, /ride\.dismountRadius=config\.dismountRadius/);
});
