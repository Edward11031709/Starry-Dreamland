import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const checklist = readFileSync(new URL("../docs/RELEASE_CHECKLIST_zh-TW.md", import.meta.url), "utf8");
const guide = readFileSync(new URL("../docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");

test("release documentation no longer instructs direct uploads or commits to main", () => {
  assert.doesNotMatch(checklist, /上傳至 main 分支根目錄/);
  assert.doesNotMatch(guide, /Add file\s*→\s*Upload files/);
  assert.doesNotMatch(guide, /Commit changes[\s\S]{0,80}main/);
});

test("release guidance requires owner review and a manual workflow dispatch", () => {
  assert.match(checklist, /專案擁有者已親自檢查並明確批准/);
  assert.match(checklist, /workflow_dispatch/);
  assert.match(checklist, /confirm_release=true/);
  assert.match(guide, /production Environment/);
  assert.match(guide, /release\.json/);
});

test("the current Pages workflow gates deployment to an owner-confirmed main dispatch", () => {
  const deploy = workflow.slice(workflow.indexOf("\n  deploy:"));
  assert.match(workflow, /pull_request:/);
  assert.match(deploy, /github\.event_name == 'workflow_dispatch'/);
  assert.match(deploy, /github\.ref == 'refs\/heads\/main'/);
  assert.match(deploy, /github\.actor == 'Edward11031709'/);
  assert.match(deploy, /inputs\.confirm_release == true/);
  assert.match(deploy, /environment:\s*\n\s*name:\s*production/);
});
