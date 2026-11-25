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

const assets = section("const PREMIUM_PARK_ASSETS = [", "function sha256Hex(");
const mount = section("function mountPremiumAsset(", "async function loadPremiumParkAssets(");
const environment = section("function buildEnvironment(", "function createParkMotes(");

test("the hand-painted alchemist and apothecary are separate GLB assets with source pages", () => {
  const alchemist = assetLine("alchemist-shop");
  const apothecary = assetLine("apothecary-shop");
  const guild = assetLine("adventurers-guild");
  assert.ok(alchemist.includes("/assets/32732/v1/model.glb"));
  assert.ok(alchemist.includes("alchemist-shop-d5f14853"));
  assert.ok(apothecary.includes("/assets/32736/v1/model.glb"));
  assert.ok(apothecary.includes("apothecary-shop-922c13d1"));
  assert.ok(alchemist.includes('animations:["crystal-spin","sign-sway"]'));
  assert.ok(apothecary.includes('animations:["sign-sway"]'));
  assert.ok(guild.includes("/assets/32743/v1/model.glb"));
  assert.ok(guild.includes("adventurers-guild-hall-d597e1c9"));
  assert.ok(guild.includes('animations:["banner-sway","sign-sway"]'));
  assert.ok(alchemist.includes("batch:4") && apothecary.includes("batch:4") && guild.includes("batch:4"));
});

test("each fantasy shop has its own placement, facing, collider and discovery zone", () => {
  for (const [id, x, rotation, label] of [
    ["alchemist-shop", "25.5", "-2.33", "星辰煉金工坊"],
    ["apothecary-shop", "-25.5", "2.33", "月草藥劑工坊"],
    ["adventurers-guild", "0", "0", "星際冒險者公會"]
  ]) {
    const config = assetLine(id);
    const expectedPosition=id==="adventurers-guild"?"position:[0,0.87,-34]":"position:[" + x + ",0.87,25]";
    assert.ok(config.includes(expectedPosition), id + " position");
    assert.ok(config.includes("rotationY:" + rotation), id + " should face the promenade");
    assert.ok(config.includes(id==="adventurers-guild"?"colliderRadius:4.8":"colliderRadius:3.8"), id + " collider");
    assert.ok(config.includes('name:"' + label + '"'), id + " discovery label");
    assert.ok(config.includes("discovery:{"), id + " discovery zone");
  }
});

test("rotated GLB buildings pivot around their measured bounds centre", () => {
  const positioned = mount.slice(mount.indexOf("}else if(config.position){"));
  assert.match(positioned, /bounds\.getCenter\(new THREE\.Vector3\(\)\)/);
  assert.match(positioned, /placement\.position\.set\(config\.position\[0\],config\.position\[1\],config\.position\[2\]\)/);
  assert.match(positioned, /placement\.rotation\.y=config\.rotationY/);
  assert.match(positioned, /model\.position\.set\(-center\.x\*scale,groundOffset,-center\.z\*scale\)/);
  assert.match(positioned, /placement\.add\(model\)/);
});

test("placed fantasy buildings register collision and exploration metadata", () => {
  const positioned = mount.slice(mount.indexOf("}else if(config.position){"));
  assert.match(positioned, /world\.environment\.colliders\.push\(/);
  assert.match(positioned, /radius:config\.colliderRadius,label:config\.name\|\|config\.id/);
  assert.match(positioned, /world\.environment\.discoveryZones\.push\(/);
  assert.match(positioned, /x:config\.position\[0\],z:config\.position\[2\]/);
});

test("both hand-painted shop districts have connected promenade branches and plazas", () => {
  assert.match(environment, /addWalkway\(\[\[0,34\],\[8,34\],\[15\.5,31\],\[21\.5,27\.5\],\[25\.5,25\]\],3\.8\)/);
  assert.match(environment, /addWalkway\(\[\[0,34\],\[-8,34\],\[-15\.5,31\],\[-21\.5,27\.5\],\[-25\.5,25\]\],3\.8\)/);
  assert.match(environment, /addDistrictPlaza\(-25\.5,25,5\.7\)/);
  assert.match(environment, /addDistrictPlaza\(25\.5,25,5\.7\)/);
  assert.ok(environment.includes("addContactShadow(-25.5,25,8.2,8.2,0.88)"));
  assert.ok(environment.includes("addContactShadow(25.5,25,8.2,8.2,0.88)"));
  assert.ok(environment.includes("addDistrictPlaza(0,-34,5.7)"));
  assert.ok(environment.includes("addWalkway([[-8,-23],[-6,-27],[-3,-31],[0,-34]],3.8)"));
  assert.ok(environment.includes("addWalkway([[8,-23],[6,-27],[3,-31],[0,-34]],3.8)"));
  assert.ok(environment.includes("addContactShadow(0,-34,9.2,10.2,0.88)"));
});

test("trees are moved away from the new building footprints and approach paths", () => {
  const trees = environment.slice(environment.indexOf("[-35,19],[-35,8]"));
  assert.ok(trees.includes("[-36,3]"));
  assert.ok(trees.includes("[35,19]"));
  assert.ok(trees.includes("[-12,21]") && trees.includes("[12,21]"));
  assert.doesNotMatch(trees, /\[-32,27\]|\[-27,25\]|\[27,26\]|\[33,23\]|\[36,17\]/);
  assert.ok(!trees.includes("[0,-35]"), "guild plaza must remain clear of the old tree position");
});

test("the new asset batch contains buildings only and does not add NPC actors", () => {
  const newAssets = assets.split("\n").filter(line =>
    line.includes('id:"alchemist-shop"') || line.includes('id:"apothecary-shop"') || line.includes('id:"adventurers-guild"')
  );
  assert.equal(newAssets.length, 3);
  assert.ok(newAssets.every(line => line.includes("url:") && line.includes("source:")));
  assert.ok(newAssets.every(line => !line.includes('id:"npc') && !line.includes('id:"townsfolk')));
});
