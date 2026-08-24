// tests/page-assembly.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

function assertAnchorsResolve(html, label) {
  // hrefs are root-relative ("/#foo") so the browser navigates to "/" and
  // then jumps to the anchor; strip the leading "/" before comparing
  // against the id.
  const hrefIds = [...html.matchAll(/href="\/?#([\w-]+)"/g)].map((m) => m[1]);
  assert.ok(hrefIds.length > 0, `expected at least one in-page anchor link on ${label}`);

  for (const id of hrefIds) {
    const hasId = new RegExp(`id="${id}"`).test(html);
    assert.ok(hasId, `no element with id="${id}" found for anchor link on ${label}`);
  }
}

function assertNoDuplicateIds(html, label) {
  const ids = [...html.matchAll(/\sid="([\w-]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  const duplicates = new Set();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  assert.equal(
    duplicates.size,
    0,
    `duplicate id(s) found on ${label}: ${[...duplicates].join(", ")}`
  );
}

test("every in-page anchor link has a matching id, and all landmarks are present", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const html = fs.readFileSync("dist/index.html", "utf-8");

  assertAnchorsResolve(html, "index.html");
  assertNoDuplicateIds(html, "index.html");

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

test("the thank-you page's nav links resolve and has no duplicate ids", () => {
  execSync("npm run build", { cwd: process.cwd(), stdio: "pipe" });
  const thankYouPath = fs.existsSync("dist/thank-you/index.html")
    ? "dist/thank-you/index.html"
    : "dist/thank-you.html";
  const html = fs.readFileSync(thankYouPath, "utf-8");

  // Every anchor link on this page must resolve to an element with a
  // matching id ON THIS PAGE. The header/footer nav links point back to
  // homepage sections and must therefore be root-relative ("/#foo", which
  // navigates to "/" first) rather than bare "#foo" (which would be a
  // broken same-page jump here, since those section ids don't exist on
  // thank-you). The skip link's "#main" is legitimately bare, since
  // "#main" does exist on this page.
  const bareAnchorHrefs = [...html.matchAll(/href="(#[\w-]+)"/g)].map((m) => m[1]);
  const unexpectedBareHrefs = bareAnchorHrefs.filter((h) => h !== "#main");
  assert.equal(
    unexpectedBareHrefs.length,
    0,
    `expected only the skip link to use a bare "#foo" href on thank-you page, found: ${unexpectedBareHrefs.join(", ")}`
  );
  // The one legitimately bare href ("#main", the skip link) must still
  // resolve to an id on this page.
  assert.match(html, /id="main"/);

  const rootRelativeHrefs = [...html.matchAll(/href="\/#([\w-]+)"/g)].map((m) => m[1]);
  assert.ok(
    rootRelativeHrefs.length > 0,
    "expected root-relative /#foo nav links on thank-you page"
  );

  assert.match(html, /<a href="\/" class="site-header__logo"/);

  assertNoDuplicateIds(html, thankYouPath);
});
