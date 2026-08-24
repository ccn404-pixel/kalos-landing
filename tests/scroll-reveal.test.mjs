import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldAnimate } from "../src/scripts/scroll-reveal.js";

test("shouldAnimate returns false when the user prefers reduced motion", () => {
  assert.equal(shouldAnimate(true), false);
  assert.equal(shouldAnimate(false), true);
});
