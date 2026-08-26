// tests/hero.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("hero renders headline as the only h1, subhead, and both CTAs", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  const h1Matches = html.match(/<h1[ >]/g) ?? [];
  assert.equal(h1Matches.length, 1, "page should have exactly one h1");
  assert.match(html, /Software that fits\.[\s\S]*?Teams that scale\./);
  assert.match(html, /See our approach/);
  assert.match(html, /KALOS ENGAGEMENT/);
});
