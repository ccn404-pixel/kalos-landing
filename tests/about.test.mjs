// tests/about.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("about section renders overview and reliability copy", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /A partner you can rely on/);
  assert.match(html, /not generic templates/);
  assert.match(html, /minimizes risk, accelerates decision-making/);
  assert.match(html, /portrait-woman/);
});
