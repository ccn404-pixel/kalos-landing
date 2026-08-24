// tests/footer.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("footer renders nav, email, and copyright on both index and thank-you pages", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const indexHtml = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(indexHtml, /aria-label="Footer"/);
  assert.match(indexHtml, /href="mailto:pbirdsong@kalostechnology\.com"/);
  assert.match(indexHtml, /Kalos Technology\. All rights reserved\./);

  const thankYouPath = fs.existsSync("dist/thank-you/index.html")
    ? "dist/thank-you/index.html"
    : "dist/thank-you.html";
  const thankYouHtml = fs.readFileSync(thankYouPath, "utf-8");
  assert.match(thankYouHtml, /aria-label="Footer"/);
});
