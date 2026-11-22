import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
const start = source.indexOf("function makeLancetArchCurve(");
const end = source.indexOf("\nfunction makeWindow(", start);
assert.notEqual(start, -1, "makeLancetArchCurve must exist");
assert.notEqual(end, -1, "makeLancetArchCurve must end before makeWindow");

class MockVector3 {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
}
class MockCurve3 {
  constructor(points, closed, curveType) {
    this.points = points;
    this.closed = closed;
    this.curveType = curveType;
  }
}
const context = {
  THREE: { Vector3: MockVector3, CatmullRomCurve3: MockCurve3 }
};
vm.runInNewContext(`${source.slice(start, end)}\nthis.makeLancetArchCurve = makeLancetArchCurve;`, context);
const makeLancetArchCurve = context.makeLancetArchCurve;

test("lancet arch control points form a centred, symmetric pointed profile", () => {
  const curve = makeLancetArchCurve(2, 1.5, -4, 2.4, 3.2);
  assert.equal(curve.points.length, 7);
  assert.equal(curve.closed, false);
  assert.equal(curve.curveType, "centripetal");
  const [leftBase, leftSpring, leftShoulder, apex, rightShoulder, rightSpring, rightBase] = curve.points;
  assert.deepEqual([leftBase.x, leftBase.y, leftBase.z], [0.8, 1.5, -4]);
  assert.deepEqual([apex.x, apex.y, apex.z], [2, 4.7, -4]);
  assert.deepEqual([rightBase.x, rightBase.y, rightBase.z], [3.2, 1.5, -4]);
  assert.equal(leftSpring.x + rightSpring.x, 4);
  assert.equal(leftShoulder.x + rightShoulder.x, 4);
  assert.equal(leftSpring.y, rightSpring.y);
  assert.equal(leftShoulder.y, rightShoulder.y);
});

test("castle entrance uses nested lancet trim and stair balustrades", () => {
  const castleStart = source.indexOf("function buildCastle(");
  const castleEnd = source.indexOf("\nfunction buildObservatory(", castleStart);
  const castle = source.slice(castleStart, castleEnd);
  assert.match(castle, /makeLancetArchCurve\(0,1\.37,2\.17,1\.62,1\.47\)/);
  assert.match(castle, /makeLancetArchCurve\(0,1\.43,2\.215,1\.39,1\.35\)/);
  assert.match(castle, /Fine twin balustrades finish the grand stair/);
  assert.match(castle, /new THREE\.CylinderGeometry\(0\.032,0\.046,postHeight,10\)/);
});

test("park threshold repeats the castle lancet motif at three nested depths", () => {
  const gateStart = source.indexOf("function buildEntranceGate(");
  const gateEnd = source.indexOf("\\nfunction buildTicketBooth(", gateStart);
  const gate = source.slice(gateStart, gateEnd);
  assert.match(gate, /makeLancetArchCurve\\(0,3\\.72,0,6\\.24,3\\.05\\)/);
  assert.match(gate, /makeLancetArchCurve\\(0,3\\.72,-0\\.04,5\\.72,2\\.78\\)/);
  assert.match(gate, /makeLancetArchCurve\\(0,3\\.72,-0\\.08,5\\.28,2\\.55\\)/);
  assert.match(gate, /Repeat the castle's pointed lancet profile/);
});
