import { test } from "node:test";
import assert from "node:assert/strict";

test("content module exports all required sections with correct shapes", async () => {
  const c = await import("../src/data/content.ts");
  assert.equal(c.site.name, "Kalos Technology");
  assert.equal(c.site.email, "pbirdsong@kalostechnology.com");
  assert.equal(c.site.domain, "kalostechnology.com");

  assert.equal(c.nav.length, 5);

  assert.equal(c.hero.headline, "Software that fits. Teams that scale.");

  assert.equal(c.services.items.length, 5);
  assert.equal(c.whyCustom.items.length, 4);

  assert.equal(c.staffAugBenefits.items.length, 7);
  assert.ok(c.staffAugBenefits.items.some((i) => i.title.includes("50%")));
  assert.ok(c.staffAugBenefits.items.some((i) => i.title.includes("30-40%")));

  assert.equal(c.staffAugServices.items.length, 4);

  assert.equal(c.process.steps.length, 5);
  assert.equal(c.industries.items.length, 6);

  assert.equal(c.whyKalos.bullets.length, 4);
  assert.equal(c.whyKalos.whyKalosItems.length, 4);
  assert.equal(c.whyKalos.quote, "You're never just a client. You're a partner.");

  assert.equal(c.contact.email, "pbirdsong@kalostechnology.com");
});
