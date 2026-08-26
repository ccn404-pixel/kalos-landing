// tests/about.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("problem section renders the 4 problem cards on a light theme section", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="about"[^>]*class="[^"]*on-light/);
  assert.match(html, /Off-the-shelf software wasn(?:&#39;|')t built for you\./);
  assert.match(html, /Generic templates/);
  assert.match(html, /Licensing limits/);
  assert.match(html, /Slow to evolve/);
  assert.match(html, /Divided ownership/);
  assert.match(html, /portrait-woman/);
});
