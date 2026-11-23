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

function assetLine(id) {
  const line = source.split("\n").find(value => value.includes('id:"' + id + '"'));
  assert.ok(line, "missing premium asset config: " + id);
  return line;
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
    const line = assetLine(id);
    assert.ok(line.includes("seatNodeHints:["), id + " is missing seat-node hints");
    assert.ok(line.includes('"' + hint + '"'), id + " is missing the expected seat-node hint");
  }
  const ferris = assetLine("ferris-wheel");
  assert.ok(ferris.includes("parentScale:1"));
  assert.ok(ferris.includes("colliderRadius:8.0"));
  assert.ok(ferris.includes("interactionRadius:7.8"));
  assert.ok(ferris.includes("dismountRadius:8.8"));
});

test("ride anchors are attached to named GLB nodes and positioned from their measured bounds", () => {
  assert.match(seatHelpers, /function findPremiumRideSeatNode/);
  assert.match(seatHelpers, /new THREE\.Box3\(\)\.setFromObject\(node\)/);
  assert.match(seatHelpers, /seatWorld\.applyMatrix4\(inverse\)/);
  assert.match(seatHelpers, /node\.add\(anchor\)/);
  assert.match(seatHelpers, /StarryPremiumRideSeatAnchor/);
});

test("a premium ride cannot hide its playable fallback before seat and animation validation", () => {
  assert.ok(rideBranch.includes("attachPremiumRideSeat(model,config)"));
  assert.ok(rideBranch.includes("createPremiumAssetMixer(model,gltf,config)"));
  assert.ok(rideBranch.indexOf("attachPremiumRideSeat(model,config)") < rideBranch.indexOf("hideProceduralRideMeshes(ride.root)"));
  assert.ok(rideBranch.indexOf("createPremiumAssetMixer(model,gltf,config)") < rideBranch.indexOf("hideProceduralRideMeshes(ride.root)"));
  assert.match(rideBranch, /ride\.rideSeat=seat/);
  assert.match(rideBranch, /ride\.axis="asset"/);
});

test("teacups play both independent motion clips and the drop tower cycles its lift animation", () => {
  assert.ok(assetLine("teacups").includes('animations:["platform-spin","cup-spin"]'));
  assert.ok(assetLine("teacups").includes("requireAnimations:true"));
  assert.ok(assetLine("drop-tower").includes('animation:"open",pingPong:true'));
  assert.ok(assetLine("drop-tower").includes("requireAnimations:true"));
  assert.match(mount, /config\.pingPong\)action\.setLoop\(THREE\.LoopPingPong,Infinity\)/);
});

test("GLB ride animation is not double-applied by the procedural ride loop", () => {
  assert.ok(rideLoop.includes('else if(ride.axis!=="asset")'));
  assert.match(mount, /ride\.axis="asset"/);
  assert.match(mount, /world\.assetMixers\.push\(mixer\)/);
});

test("all static placements preserve the model's ground-contact offset", () => {
  assert.match(mount, /const groundOffset=-bounds\.min\.y\*scale/);
  assert.ok(mount.includes("0.68+groundOffset"));
  assert.ok(mount.includes("y+groundOffset"));
  assert.ok(mount.includes("config.position[1]+groundOffset"));
});

test("premium ride collision footprints and dismount distances follow the imported model scale", () => {
  assert.match(mount, /function applyPremiumRideFootprint/);
  assert.match(mount, /collider\.radius=config\.colliderRadius/);
  assert.match(mount, /ride\.dismountRadius=config\.dismountRadius/);
  assert.match(mount, /ride\.interactionRadius=config\.interactionRadius/);
});

test("cinematic post-processing uses multisampled render targets and a sharper mobile render scale", () => {
  assert.ok(source.includes("samples:isSmall?2:4"));
  assert.ok(source.includes("const scale=isSmall?0.86:1;"));
  assert.ok(source.includes("isSmall ? 1.08 : 1.25"));
  assert.ok(source.includes("small ? 1.08 : 1.25"));
});
