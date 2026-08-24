// tests/staff-aug-benefits.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("staff augmentation benefits section renders all 7 items with their stats", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /50% Faster Onboarding/);
  assert.match(html, /3-6 months traditional hiring/);
  assert.match(html, /30-40% Cost Savings/);
  assert.match(html, /Zero HR Complexity/);
  assert.match(html, /Full Control/);
  assert.match(html, /Flexible Scaling/);
  assert.match(html, /Global Talent Access/);
  assert.match(html, /Cultural Integration/);
});
