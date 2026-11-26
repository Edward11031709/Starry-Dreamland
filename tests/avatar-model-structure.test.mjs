import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../js/starry-3d.js", import.meta.url), "utf8");
const start = source.indexOf("function buildPlayer(");
const end = source.indexOf("\n\n\nfunction mount(", start);
assert.notEqual(start, -1, "buildPlayer must exist");
assert.notEqual(end, -1, "buildPlayer must end before mount");

class MockTransform {
  set(x, y, z) { this.x = x; this.y = y; this.z = z; }
  setScalar(value) { this.x = value; this.y = value; this.z = value; }
}

class MockGroup {
  constructor() {
    this.children = [];
    this.position = new MockTransform();
    this.scale = new MockTransform();
    this.rotation = { x: 0, y: 0, z: 0 };
    this.userData = {};
  }
  add(child) { child.parent = this; this.children.push(child); }
  traverse(callback) {
    callback(this);
    this.children.forEach(child => child.traverse ? child.traverse(callback) : callback(child));
  }
}

class MockMesh extends MockGroup {
  constructor(geometry, material) {
    super();
    this.geometry = geometry;
    this.material = material;
    this.isMesh = true;
    this.frustumCulled = true;
  }
}

class MockGeometry {
  constructor(type, args) {
    this.type = type;
    this.args = args;
  }
}

class MockMaterial {
  constructor(options) { Object.assign(this, options); }
}

class MockColor {
  constructor(value) { this.value = value; }
}

class MockShape {
  constructor() { this.commands = []; }
  moveTo(...args) { this.commands.push(["moveTo", ...args]); }
  lineTo(...args) { this.commands.push(["lineTo", ...args]); }
  quadraticCurveTo(...args) { this.commands.push(["quadraticCurveTo", ...args]); }
  closePath() { this.commands.push(["closePath"]); }
}

const THREE = new Proxy({
  Group: MockGroup,
  Mesh: MockMesh,
  MeshStandardMaterial: MockMaterial,
  MeshPhysicalMaterial: MockMaterial,
  MeshToonMaterial: MockMaterial,
  MeshBasicMaterial: MockMaterial,
  DataTexture: MockGeometry,
  Color: MockColor,
  Shape: MockShape
}, {
  get(target, property) {
    if (property in target) return target[property];
    return class extends MockGeometry {
      constructor(...args) { super(String(property), args); }
    };
  }
});

function makeMaterial(color, roughness = 0.72, metalness = 0.12, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function addMesh(parent, geometry, material, position, scale, cast = true, receive = true) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.set(position[0], position[1], position[2]);
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

const context = { THREE, makeMaterial, addMesh };
vm.runInNewContext(`${source.slice(start, end)}\nthis.buildPlayer = buildPlayer;`, context);
const buildPlayer = context.buildPlayer;

test("all existing hairstyle options build refined strands without changing appearance keys", () => {
  const expectedStrands = new Map([
    ["long", 8],
    ["short", 7],
    ["twin", 8],
    ["hood", 6]
  ]);

  for (const [hairStyle, expectedCount] of expectedStrands) {
    const scene = new MockGroup();
    const player = buildPlayer(scene, "wanderer", { appearance: { hairStyle } });

    assert.equal(scene.children[0], player, `${hairStyle} avatar should be attached to the scene`);
    assert.equal(player.userData.appearance.hairStyle, hairStyle);
    assert.equal(player.userData.hairStrandCount, expectedCount);
    assert.equal(player.userData.faceLashCount, 2, `${hairStyle} avatar should include two fine upper lashes`);
    assert.ok(player.userData.animeMaterialCount > 10, "avatar surfaces should use cel-shaded materials");
    assert.ok(player.userData.animeOutlineCount >= 4, "main outfit and head silhouette should have ink contours");
    const toonMeshes = [];
    player.traverse(object => { if (object.isMesh) toonMeshes.push(object); });
    assert.ok(toonMeshes.some(object => object.material instanceof MockMaterial && object.material.gradientMap),
      "avatar must contain MeshToonMaterial surfaces");
    assert.ok(player.children.length > 0, `${hairStyle} avatar should contain model geometry`);
  }
});


test("traveler face uses a sculpted tapered profile without changing saved appearance keys", () => {
  const scene = new MockGroup();
  const player = buildPlayer(scene, "wanderer", { appearance: { hairStyle: "long" } });
  const faceMeshes = [];
  player.traverse(object => {
    if (object.isMesh && object.userData?.animeFaceShape === "tapered-oval") faceMeshes.push(object);
  });

  assert.equal(faceMeshes.length, 1, "one sculpted face mesh should be created");
  const faceMesh = faceMeshes[0];
  assert.equal(faceMesh.geometry.type, "LatheGeometry");
  assert.equal(faceMesh.geometry.args[1], 48, "face profile should use a smooth radial silhouette");
  const profile = faceMesh.geometry.args[0];
  const radii = profile.map(point => point.args[0]);
  assert.equal(profile.length, 13, "face should use the authored 13-point contour");
  assert.equal(radii[0], 0, "chin should taper to the profile axis");
  assert.equal(radii.at(-1), 0, "crown should close cleanly at the profile axis");
  assert.ok(radii[6] > radii[2], "cheek width should exceed the lower jaw width");
  assert.ok(radii[6] > radii[10], "temple should taper above the cheek line");
  assert.equal(player.userData.faceShape, "tapered-oval");
  assert.equal(player.userData.faceProfilePointCount, 13);
  assert.deepEqual(Object.keys(player.userData.appearance).sort(),
    ["accentColor", "hairColor", "hairStyle", "skinTone"]);
});
