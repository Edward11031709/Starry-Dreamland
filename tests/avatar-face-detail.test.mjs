import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
const start = source.indexOf("function buildPlayer(");
const end = source.indexOf("\nfunction ", start + 1);
const buildPlayer = source.slice(start, end === -1 ? undefined : end);

test("traveler face uses curved eyelids and brows instead of flat brow blocks", () => {
  assert.notEqual(start, -1, "buildPlayer exists");
  assert.match(buildPlayer, /const addFaceCurve=\(points,radius,material\)=>/);
  assert.match(buildPlayer, /const upperLid=addFaceCurve\(/);
  assert.match(buildPlayer, /const lowerLid=addFaceCurve\(/);
  assert.match(buildPlayer, /const brow=addFaceCurve\(/);
  assert.match(buildPlayer, /new THREE\.TubeGeometry\(curve,18,radius,6,false\)/);
  assert.doesNotMatch(buildPlayer, /const brow=addMesh\(headRig,new THREE\.BoxGeometry/);
});

test("traveler face includes sculpted nose, inner ears, earrings and shaped lips", () => {
  assert.match(buildPlayer, /const noseBridge=addMesh\(headRig,new THREE\.SphereGeometry/);
  assert.match(buildPlayer, /const noseTip=addMesh\(headRig,new THREE\.SphereGeometry/);
  assert.match(buildPlayer, /const earInner=addMesh\(headRig,new THREE\.SphereGeometry/);
  assert.match(buildPlayer, /new THREE\.TorusGeometry\(0\.043,0\.012,6,24\)/);
  assert.match(buildPlayer, /const upperLip=addFaceCurve\(/);
  assert.match(buildPlayer, /const lowerLip=addFaceCurve\(/);
});

test("facial details remain inside the scaled head rig and preserve appearance data", () => {
  const headStart = buildPlayer.indexOf("const headRig=new THREE.Group();");
  const headEnd = buildPlayer.indexOf("// Traveler archetype controls the silhouette");
  assert.ok(headStart >= 0 && headEnd > headStart, "scaled head rig block is present");
  const headBlock = buildPlayer.slice(headStart, headEnd);
  assert.ok(headBlock.includes("const upperLid=addFaceCurve("));
  assert.ok(headBlock.includes("const noseBridge=addMesh("));
  assert.ok(headBlock.includes("const upperLip=addFaceCurve("));
  assert.match(buildPlayer, /hairStyle:hairStyles\.includes\(rawAppearance\.hairStyle\)/);
  assert.match(buildPlayer, /skinTone:skinTones\.includes\(rawAppearance\.skinTone\)/);
  assert.match(buildPlayer, /player\.userData\.appearance=appearance/);
});
