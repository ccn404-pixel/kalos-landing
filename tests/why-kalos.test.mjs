// tests/why-kalos.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("why-kalos renders as one full-bleed proof section with a numbered list and a logo marquee", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Built by experts\. Trusted by businesses\./);
  assert.match(html, /Strong focus on reliability, scalability, security, and results\./);
  assert.match(html, /Pre-vetted, globally distributed developer talent\./);
  assert.match(html, /You(?:&#39;|&rsquo;|')re never just a client\./);
  assert.match(html, /team-collaboration/);
  assert.match(html, /class="logo-reel"/);
  assert.match(html, /KALOS TECHNOLOGY/);
});
