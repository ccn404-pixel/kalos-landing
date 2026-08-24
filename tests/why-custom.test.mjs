// tests/why-custom.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("why-custom section renders all 4 checklist items", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Built exactly for your workflows/);
  assert.match(html, /Easier to scale and evolve/);
  assert.match(html, /No unnecessary features or licensing limits/);
  assert.match(html, /Full ownership and long-term flexibility/);
});
