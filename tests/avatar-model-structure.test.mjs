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


test("five traveler types receive distinct sculpted face profiles without changing saved appearance keys", () => {
  const expectedShapes = new Map([
    ["wanderer", "balanced-oval"],
    ["mage", "slender-oval"],
    ["knight", "defined-jaw"],
    ["priest", "soft-cheek"],
    ["guardian", "noble-oval"]
  ]);
  const profiles = new Map();

  for (const [avatarType, expectedShape] of expectedShapes) {
    const scene = new MockGroup();
    const player = buildPlayer(scene, "wanderer", {
      avatarType,
      appearance: { hairStyle: "long" }
    });
    const faces = [];
    player.traverse(object => {
      if (object.isMesh && object.userData?.animeFaceShape) faces.push(object);
    });

    assert.equal(faces.length, 1, `${avatarType} should build exactly one face mesh`);
    const face = faces[0];
    assert.equal(face.geometry.type, "LatheGeometry");
    assert.equal(face.geometry.args[1], 48);
    assert.equal(face.userData.animeFaceShape, expectedShape);
    assert.equal(face.userData.faceProfilePointCount, 13);
    assert.equal(player.userData.faceShape, expectedShape);
    assert.equal(player.userData.faceProfileAvatarType, avatarType);

    const profile = face.geometry.args[0];
    const radii = profile.map(point => point.args[0]);
    assert.equal(profile.length, 13);
    assert.equal(radii[0], 0, "chin should close at the profile axis");
    assert.equal(radii.at(-1), 0, "forehead crown should close at the profile axis");
    assert.ok(radii[6] > radii[2], "cheek contour should remain wider than the lower jaw");
    assert.deepEqual(Object.keys(player.userData.appearance).sort(),
      ["accentColor", "hairColor", "hairStyle", "skinTone"]);
    profiles.set(avatarType, radii);
  }

  assert.ok(profiles.get("mage")[3] < profiles.get("wanderer")[3],
    "mage profile should have a subtly narrower jaw");
  assert.ok(profiles.get("knight")[3] > profiles.get("wanderer")[3],
    "knight profile should have a more defined jaw");
  assert.ok(profiles.get("priest")[6] > profiles.get("wanderer")[6],
    "priest profile should have softer cheek fullness");
  assert.ok(profiles.get("guardian")[10] > profiles.get("wanderer")[10],
    "guardian profile should have a slightly broader upper contour");

  const fallback = buildPlayer(new MockGroup(), "wanderer", { avatarType: "unknown-role" });
  assert.equal(fallback.userData.faceShape, "balanced-oval",
    "unknown traveler types should safely fall back to the balanced profile");
});
