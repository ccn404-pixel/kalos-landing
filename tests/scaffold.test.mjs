// tests/scaffold.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("astro build produces dist/index.html", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  assert.ok(fs.existsSync("dist/index.html"), "dist/index.html should exist after build");
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Kalos Technology/);
});
