// tests/services.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("services section renders id anchor and all 5 service cards", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="custom-software"/);
  assert.match(html, /Custom software development/);
  assert.match(html, /SaaS product development/);
  assert.match(html, /Web (?:&#38;|&amp;|&) ?cloud applications/);
  assert.match(html, /System integrations (?:&#38;|&amp;|&) ?automation/);
  assert.match(html, /Modernization (?:&#38;|&amp;|&) ?optimization/);
});
