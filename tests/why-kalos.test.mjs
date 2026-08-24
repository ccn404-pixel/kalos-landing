// tests/why-kalos.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("why-kalos section renders bullets, why-kalos items, and pull quote", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /Built by Experts\. Trusted by Businesses\./);
  assert.match(html, /Strong focus on reliability, scalability, and security/);
  assert.match(html, /We focus on outcomes, not just code/);
  assert.match(html, /You&#39;re never just a client\. ?You&#39;re a partner\.|You're never just a client\./);
});
