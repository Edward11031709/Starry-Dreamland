import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const optionsStart = source.indexOf("const AVATAR_OPTIONS=");
const optionsEnd = source.indexOf("const PARK_DISCOVERIES", optionsStart);
assert.ok(optionsStart >= 0 && optionsEnd > optionsStart, "avatar option configuration exists");
const config = vm.runInNewContext(
  source.slice(optionsStart, optionsEnd) + "\n({ AVATAR_OPTIONS, AVATAR_TYPES, DEFAULT_APPEARANCE, AVATAR_PRESETS })"
);
const { AVATAR_OPTIONS, AVATAR_TYPES, DEFAULT_APPEARANCE, AVATAR_PRESETS } = JSON.parse(JSON.stringify(config));

test("four appearance presets use only existing, validated appearance values", () => {
  assert.equal(AVATAR_PRESETS.length, 4);
  const allowedKeys = ["accentColor", "hairColor", "hairStyle", "skinTone"];
  for (const preset of AVATAR_PRESETS) {
    assert.deepEqual(Object.keys(preset.appearance).sort(), allowedKeys);
    for (const [key, value] of Object.entries(preset.appearance)) {
      assert.ok(AVATAR_OPTIONS[key].some(option => option.id === value), `${preset.id} uses a supported ${key}`);
    }
  }
  assert.deepEqual(Object.keys(DEFAULT_APPEARANCE).sort(), allowedKeys);
});

test("preset application updates the live preview without saving or spending", () => {
  const start = source.indexOf("function applyAvatarPreset(");
  const end = source.indexOf("\nfunction ", start + 1);
  const apply = source.slice(start, end);
  assert.notEqual(start, -1, "applyAvatarPreset exists");
  assert.match(apply, /AVATAR_PRESETS\.find/);
  assert.match(apply, /applyAvatarAppearanceDraft\(/);
  assert.doesNotMatch(apply, /saveAvatarCustomization|sd_customize_avatar|sb\.rpc|avatarPoints|localStorage/);
});

test("preset controls are accessible, responsive and explicitly unsaved until confirmation", () => {
  assert.match(source, /data-avatar-preset=/);
  assert.match(source, /aria-pressed="false"/);
  assert.match(source, /id="avatarPresetStatus" aria-live="polite"/);
  assert.match(source, /if\(b\.dataset\.avatarPreset\)\{applyAvatarPreset/);
  assert.match(source, /\.avatar-preset-list\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(source, /\.avatar-preset-list\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
});



test("random appearance drafts stay inside the existing allowlists and only update preview controls", () => {
  const start = source.indexOf("function applyAvatarAppearanceDraft(");
  const end = source.indexOf("\nlet atelierPreviewWaiting", start);
  assert.ok(start >= 0 && end > start, "appearance draft helpers exist");
  const helpers = source.slice(start, end);
  const controls = {
    avatarHairStyle: { value: "" },
    avatarHairColor: { value: "" },
    avatarSkinTone: { value: "" },
    avatarAccentColor: { value: "" },
    avatarTypeSelect: { value: "" }
  };
  let previewUpdates = 0;
  const math = Object.create(Math);
  math.random = () => 0;
  const context = {
    AVATAR_OPTIONS, AVATAR_TYPES, DEFAULT_APPEARANCE, AVATAR_PRESETS,
    document: { getElementById: id => controls[id] || null },
    updateAvatarAtelierPreview: () => { previewUpdates += 1; },
    Math: math
  };
  vm.runInNewContext("let atelierPreviewOutfit = \"wanderer\";\n" + helpers + "\nrandomizeAvatarAppearance();", context);
  const controlIds = {
    hairStyle: "avatarHairStyle",
    hairColor: "avatarHairColor",
    skinTone: "avatarSkinTone",
    accentColor: "avatarAccentColor"
  };
  for (const [key, id] of Object.entries(controlIds)) {
    assert.ok(AVATAR_OPTIONS[key].some(option => option.id === controls[id].value), \`randomized \${key} stays allowlisted\`);
  }
  assert.ok(AVATAR_TYPES.some(option => option.id === controls.avatarTypeSelect.value));
  assert.equal(previewUpdates, 1);
  assert.doesNotMatch(helpers, /saveAvatarCustomization|sd_customize_avatar|sb\.rpc|avatarPoints|localStorage/);
});

test("restore action returns the editor and outfit preview to the saved profile without writing", () => {
  const start = source.indexOf("function applyAvatarAppearanceDraft(");
  const end = source.indexOf("\nlet atelierPreviewWaiting", start);
  assert.ok(start >= 0 && end > start, "appearance draft helpers exist");
  const helpers = source.slice(start, end);
  const profile = {
    avatarId: "celestial-guardian",
    avatarType: "priest",
    appearance: { hairStyle: "twin", hairColor: "#633e69", skinTone: "#cc9877", accentColor: "#65c5e3" }
  };
  const controls = {
    avatarHairStyle: { value: "short" },
    avatarHairColor: { value: "#d4b67c" },
    avatarSkinTone: { value: "#e9bea0" },
    avatarAccentColor: { value: "#f1d18e" },
    avatarTypeSelect: { value: "wanderer" },
    avatarPreviewName: { textContent: "" }
  };
  let previewUpdates = 0;
  const context = {
    AVATAR_OPTIONS, AVATAR_TYPES, DEFAULT_APPEARANCE, AVATAR_PRESETS,
    AVATARS: [{ id: "celestial-guardian", name: "星界守護者" }],
    me: () => profile,
    document: { getElementById: id => controls[id] || null },
    updateAvatarAtelierPreview: () => { previewUpdates += 1; }
  };
  vm.runInNewContext("let atelierPreviewOutfit = \"wanderer\";\n" + helpers + "\nrestoreSavedAvatarAppearance();", context);
  assert.equal(controls.avatarHairStyle.value, profile.appearance.hairStyle);
  assert.equal(controls.avatarHairColor.value, profile.appearance.hairColor);
  assert.equal(controls.avatarSkinTone.value, profile.appearance.skinTone);
  assert.equal(controls.avatarAccentColor.value, profile.appearance.accentColor);
  assert.equal(controls.avatarTypeSelect.value, profile.avatarType);
  assert.equal(controls.avatarPreviewName.textContent, "星界守護者");
  assert.equal(previewUpdates, 1);
});

test("randomize and restore controls are wired and saved-state feedback is visible", () => {
  assert.match(source, /data-avatar-randomize/);
  assert.match(source, /data-avatar-restore/);
  assert.match(source, /if\(b\.dataset\.avatarRandomize!==undefined\)\{randomizeAvatarAppearance\(\);return\}/);
  assert.match(source, /if\(b\.dataset\.avatarRestore!==undefined\)\{restoreSavedAvatarAppearance\(\);return\}/);
  assert.match(source, /目前為已保存的自訂外觀/);
  assert.match(source, /目前預覽：.*尚未保存/);
});
