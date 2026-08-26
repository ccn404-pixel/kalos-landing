// tests/react-islands.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

// The Task 1 smoke island (src/react/shared/__smoke__/SmokeIsland.tsx) proved
// the SSR pipeline works — see task-1-report.md for the RED/GREEN evidence —
// then was deleted per the task brief's Step 8. Task 4 lands the real Hero
// island, so this test now checks for its mount point instead.
test("a React island SSRs its content into the static build", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /class="process-stack"/);
});
