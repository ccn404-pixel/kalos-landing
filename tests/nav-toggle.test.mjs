import { test } from "node:test";
import assert from "node:assert/strict";
import { nextAriaExpanded } from "../src/scripts/nav-toggle.js";

test("nextAriaExpanded flips the boolean string state", () => {
  assert.equal(nextAriaExpanded("false"), "true");
  assert.equal(nextAriaExpanded("true"), "false");
});
