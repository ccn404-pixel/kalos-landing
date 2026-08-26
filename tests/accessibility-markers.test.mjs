// tests/accessibility-markers.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("decorative SVGs are aria-hidden and every section has an accessible name", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");

  const svgBlocks = [...html.matchAll(/<svg[^>]*>/g)].map((m) => m[0]);
  assert.ok(svgBlocks.length > 0, "expected decorative SVGs in the page");
  const decorativeSvgs = svgBlocks.filter((tag) => !tag.includes('role="img"'));
  for (const tag of decorativeSvgs) {
    assert.match(tag, /aria-hidden="true"/, `decorative svg missing aria-hidden: ${tag}`);
  }

  const sectionIds = [...html.matchAll(/<section id="([\w-]+)"[^>]*aria-labelledby="([\w-]+)"/g)];
  assert.ok(sectionIds.length >= 8, "expected most sections to declare id + aria-labelledby together");
  for (const [, , headingId] of sectionIds) {
    assert.match(html, new RegExp(`id="${headingId}"`), `no heading found with id="${headingId}"`);
  }
});
