// tests/industries.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("industries section renders id anchor and all 6 industries", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="industries"/);
  for (const item of [
    "Healthcare",
    "SaaS",
    "Logistics",
    "Finance",
    "Enterprise Operations",
    "Data-Driven Platforms",
  ]) {
    assert.ok(html.includes(item), `expected industry "${item}" in output`);
  }
});
