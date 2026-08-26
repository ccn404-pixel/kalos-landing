// tests/staff-aug-services.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("staff augmentation services section renders all 4 services", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Specialized Developer Augmentation/);
  assert.match(html, /Flexible Team Scaling/);
  assert.match(html, /Technical Expertise on Demand/);
  assert.match(html, /Hybrid Partnerships/);
  assert.match(html, /React, Node\.js, Cloud Architecture, DevOps/);
  assert.match(html, /AI, ML (?:&#38;|&amp;|&) ?Advanced Technical Roles/);
});
