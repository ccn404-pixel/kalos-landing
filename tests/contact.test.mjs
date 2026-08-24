// tests/contact.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("contact section renders Netlify-compatible form and direct contact links", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");
  assert.match(html, /id="contact"/);
  assert.match(html, /name="contact"/);
  assert.match(html, /data-netlify="true"/);
  assert.match(html, /netlify-honeypot="bot-field"/);
  assert.match(html, /name="form-name" value="contact"/);
  assert.match(html, /type="email" required/);
  assert.match(html, /href="mailto:pbirdsong@kalostechnology\.com"/);
  assert.match(html, /href="https:\/\/kalostechnology\.com"/);

  assert.ok(fs.existsSync("dist/thank-you/index.html") || fs.existsSync("dist/thank-you.html"));
});
