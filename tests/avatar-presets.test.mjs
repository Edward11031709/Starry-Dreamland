import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const optionsStart = source.indexOf("const AVATAR_OPTIONS=");
const optionsEnd = source.indexOf("const PARK_DISCOVERIES", optionsStart);
assert.ok(optionsStart >= 0 && optionsEnd > optionsStart, "avatar option configuration exists");
const config = vm.runInNewContext(
  source.slice(optionsStart, optionsEnd) + "\n({ AVATAR_OPTIONS, DEFAULT_APPEARANCE, AVATAR_PRESETS })"
);
const { AVATAR_OPTIONS, DEFAULT_APPEARANCE, AVATAR_PRESETS } = JSON.parse(JSON.stringify(config));

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
  assert.match(apply, /updateAvatarAtelierPreview\(\)/);
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
