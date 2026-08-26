import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("header renders all nav links, logo, and CTA", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /aria-label="Primary"/);
  assert.match(html, /href="\/#custom-software"/);
  assert.match(html, /href="\/#staff-augmentation"/);
  assert.match(html, /href="\/#approach"/);
  assert.match(html, /href="\/#industries"/);
  assert.match(html, /href="\/#contact"/);
  assert.match(html, /Start the conversation/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /<a href="\/" class="site-header__logo"/);
  assert.match(html, /logo-icon/);
});
