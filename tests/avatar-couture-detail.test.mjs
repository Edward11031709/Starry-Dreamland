import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source=readFileSync(new URL("../js/starry-3d.js",import.meta.url),"utf8");
const start=source.indexOf("function buildPlayer(");
const end=source.indexOf("\n\n\nfunction mount(",start);
assert.ok(start>=0&&end>start);
const model=source.slice(start,end);
test("traveler outfit has a split rear mantle with metallic piping and a reverse clasp",()=>{
 assert.match(model,/Split velvet mantle tails/);
 assert.match(model,/new THREE\.ExtrudeGeometry\(tailShape/);
 assert.match(model,/backMantleMaterial/);
 assert.match(model,/const backClasp=/);
 assert.match(model,/coutureGold,0\.009/);
});
test("traveler boots have finished metallic toe caps without adding saved appearance fields",()=>{
 assert.match(model,/new THREE\.SphereGeometry\(0\.09,14,10\),metal/);
 assert.match(model,/const bootPiping=/);
 assert.match(model,/player\.userData\.appearance=appearance/);
 assert.doesNotMatch(model,/appearance\.(capeStyle|bootStyle|mantleStyle)/);
});
