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

test("tower silhouettes use a sculpted lathed spire with carved ribs and bands", () => {
  const tower = section("function addTower(", "function addCrystal(");
  assert.match(tower, /new THREE\.LatheGeometry\(spireProfile,32\)/);
  assert.match(tower, /new THREE\.TubeGeometry\(new THREE\.CatmullRomCurve3\(points\)/);
  assert.match(tower, /for\(let rib=0;rib<8;rib\+\+\)/);
  assert.match(tower, /new THREE\.TorusGeometry\(ringRadius,0\.022,6,40\)/);
});

test("moonlit trees use curved limbs and broad clustered canopies, not stacked cone tiers", () => {
  const tree = section("function createTree(", "function makeIsland(");
  assert.match(tree, /new THREE\.LatheGeometry\(trunkProfile,16\)/);
  assert.match(tree, /for\(let branch=0;branch<5;branch\+\+\)/);
  assert.match(tree, /new THREE\.DodecahedronGeometry\(0\.72,1\)/);
  assert.match(tree, /const canopyClusters=/);
  assert.doesNotMatch(tree, /new THREE\.ConeGeometry/);
});

test("castle facade has a cathedral gable, secondary lancet glazing and carved buttresses", () => {
  const castle = section("function buildCastle(", "function buildObservatory(");
  assert.match(castle, /const gableShape=new THREE\.Shape\(\)/);
  assert.match(castle, /new THREE\.ExtrudeGeometry\(gableShape/);
  assert.match(castle, /const gableEdge=new THREE\.CatmullRomCurve3/);
  assert.match(castle, /gableWindowMat/);
  assert.match(castle, /new THREE\.CylinderGeometry\(0\.18,0\.34,3\.5,6\)/);
  assert.match(castle, /new THREE\.BoxGeometry\(0\.61,1\.24,0\.065\)/);
});

test("observatory has an enlarged ribbed dome and a detailed telescope", () => {
  const observatory = section("function buildObservatory(", "function buildEntranceGate(");
  assert.match(observatory, /new THREE\.SphereGeometry\(1\.08,40,24/);
  assert.match(observatory, /for\(let rib=0;rib<16;rib\+\+\)/);
  assert.match(observatory, /const telescope=new THREE\.Group/);
  assert.match(observatory, /StargazerObservatory/);
});

test("park entrance is framed by side chapels and a stepped approach", () => {
  const gate = section("function buildEntranceGate(", "function buildTicketBooth(");
  assert.match(gate, /Sculpted side chapels/);
  assert.match(gate, /addTower\(wing,0,0,1\.42,2\.25,0\.34,materials,true\)/);
  assert.match(gate, /for\(let step=0;step<4;step\+\+\)/);
  assert.match(gate, /thresholdSeal|TorusGeometry\(0\.82,0\.035/);
});

test("ticket booth is an octagonal pavilion with a ribbed lantern roof", () => {
  const booth = section("function buildTicketBooth(", "function buildCarousel(");
  assert.match(booth, /StarDreamTicketPavilion/);
  assert.match(booth, /new THREE\.CylinderGeometry\(1\.42,1\.52,1\.66,10\)/);
  assert.match(booth, /new THREE\.LatheGeometry\(roofProfile,40\)/);
  assert.match(booth, /new THREE\.TubeGeometry\(new THREE\.CatmullRomCurve3\(points\)/);
  assert.match(booth, /STARDREAM TICKETS/);
});

test("district gateways use nested pointed arches that match the castle", () => {
  const environment = section("function buildEnvironment(", "function createParkMotes(");
  assert.match(environment, /makeLancetArchCurve\(0,3\.06,0,width-0\.76,1\.55\)/);
  assert.match(environment, /makeLancetArchCurve\(0,3\.09,-0\.065,width-1\.18,1\.34\)/);
});

test("castle approach includes a matched pair of moonlit reflecting pools", () => {
  const pool = section("function addReflectingPool(", "function buildEnvironment(");
  const environment = section("function buildEnvironment(", "function createParkMotes(");
  assert.match(pool, /new THREE\.CylinderGeometry\(0\.98,0\.98,0\.035,56\)/);
  assert.match(pool, /new THREE\.TorusGeometry\(0\.28\+ripple\*0\.19/);
  assert.match(environment, /addReflectingPool\(island,materials,-5\.35,-14\.95\)/);
  assert.match(environment, /addReflectingPool\(island,materials,5\.35,-14\.95\)/);
  assert.match(environment, /addCollider\(-5\.35,-14\.95,1\.35/);
  assert.match(environment, /addCollider\(5\.35,-14\.95,1\.35/);
});

test("floating island perimeter is finished with instanced balustrade", () => {
  const environment = section("function buildEnvironment(", "function createParkMotes(");
  assert.match(environment, /FloatingIslandPerimeterBalustrade/);
  assert.match(environment, /new THREE\.InstancedMesh\(postGeometry,materials\.silverMetal,128\)/);
  assert.match(environment, /new THREE\.InstancedMesh\(capGeometry,materials\.crystal,128\)/);
  assert.match(environment, /playableRadius:41\.2/);
});

test("night environment uses a layered indigo twilight sky dome", () => {
  const sky = section("function createSkyDome(", "function createStarfield(");
  const mount = section("function mount(host)", "const avatarPreviews=");
  assert.match(sky, /LayeredIndigoTwilightSky/);
  assert.match(sky, /new THREE\.SphereGeometry\(210,64,32\)/);
  assert.match(sky, /createLinearGradient/);
  assert.match(mount, /const skyDome = createSkyDome\(scene\)/);
});

test("service stalls are rebuilt as architectural crystal pavilions, without fabric awnings", () => {
  const service = section("function buildArcadeStalls(", "function addReflectingPool(");
  assert.match(service, /CelestialServicePavilions/);
  assert.match(service, /makeLancetArchCurve\(0,0\.88,0\.02,1\.78,1\.58\)/);
  assert.match(service, /octagonal roof/i);
  assert.doesNotMatch(service, /scalloped front edge|alternating fabric panels/);
  assert.match(service, /StardustExchangePavilion/);
  assert.match(service, /TravelerSupplyPavilion/);
});

test("signature rides are enlarged with matching boarding and collision boundaries", () => {
  const ferris = section("function buildFerrisWheel(", "function buildRollerCoaster(");
  const coaster = section("function buildRollerCoaster(", "function buildTeacupRide(");
  const teacups = section("function buildTeacupRide(", "function buildDropTower(");
  const environment = section("function buildEnvironment(", "function createParkMotes(");
  assert.match(ferris, /root\.scale\.setScalar\(1\.22\)/);
  assert.match(ferris, /for\(let i=0;i<12;i\+\+\)/);
  assert.match(ferris, /interactionRadius:5\.55,dismountRadius:6\.2/);
  assert.match(coaster, /root\.scale\.setScalar\(1\.2\)/);
  assert.match(coaster, /interactionRadius:6\.2,dismountRadius:6\.7/);
  assert.match(teacups, /new THREE\.LatheGeometry\(cupProfile,32\)/);
  assert.match(teacups, /handle\.scale\.set\(1,1\.25,0\.82\)/);
  assert.match(environment, /addCollider\(25,-17,4\.55,"星河摩天輪"\)/);
  assert.match(environment, /addCollider\(-24\.5,-19\.0,5\.4,"星際雲霄飛車"\)/);
  assert.match(environment, /addCollider\(-13,-11\.5,3\.55,"星月茶杯"\)/);
});
