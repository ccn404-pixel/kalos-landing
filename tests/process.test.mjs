// tests/process.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("process section renders id anchor and all 5 steps in order", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="approach"/);
  const order = [
    "Discovery &amp; Strategy",
    "Solution Design",
    "Agile Development",
    "Testing &amp; Quality Assurance",
    "Launch &amp; Scale",
  ];
  let lastIndex = -1;
  for (const title of order) {
    const idx = html.indexOf(title);
    assert.ok(idx > lastIndex, `${title} should appear after the previous step`);
    lastIndex = idx;
  }
});
