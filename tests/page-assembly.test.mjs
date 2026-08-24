// tests/page-assembly.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("every in-page anchor link has a matching id, and all landmarks are present", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");

  const hrefIds = [...html.matchAll(/href="#([\w-]+)"/g)].map((m) => m[1]);
  assert.ok(hrefIds.length > 0, "expected at least one in-page anchor link");

  for (const id of hrefIds) {
    const hasId = new RegExp(`id="${id}"`).test(html);
    assert.ok(hasId, `no element with id="${id}" found for href="#${id}"`);
  }

  assert.match(html, /<header/);
  assert.match(html, /<main id="main"/);
  assert.match(html, /<footer/);

  const sectionCount = (html.match(/<section/g) ?? []).length;
  const labelledbyCount = (html.match(/aria-labelledby="/g) ?? []).length;
  assert.ok(
    labelledbyCount >= sectionCount - 1,
    `expected most sections to have aria-labelledby (sections: ${sectionCount}, labelledby: ${labelledbyCount})`
  );
});
