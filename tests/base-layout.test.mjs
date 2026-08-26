// tests/base-layout.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("base layout renders SEO meta, skip link, and canonical URL", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /<title>Kalos Technology \| Bespoke Software Development/);
  assert.match(html, /name="description" content="Kalos Technology designs custom software/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /family=IBM\+Plex\+Mono/);
  assert.match(html, /rel="canonical" href="https:\/\/kalostechnology\.com/);
});
