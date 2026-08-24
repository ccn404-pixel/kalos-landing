// tests/staff-aug-intro.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("staff augmentation intro renders id anchor, headline, and both explainer panels", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="staff-augmentation"/);
  assert.match(html, /Custom teams\. Built to scale\./);
  assert.match(html, /What is Staff Augmentation\?/);
  assert.match(html, /Key Difference from Outsourcing/);
  assert.match(html, /augmented staff maintain YOUR full control/);
});
