// tests/hero-scene.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateNodes, buildEdges } from "../src/react/hero/network-geometry.ts";

test("generateNodes is deterministic for a given seed", () => {
  const a = generateNodes(42);
  const b = generateNodes(42);
  assert.equal(a.length, 24);
  assert.deepEqual(
    a.map((v) => [v.x, v.y, v.z]),
    b.map((v) => [v.x, v.y, v.z])
  );
});

test("buildEdges only connects nodes within maxDist", () => {
  const nodes = generateNodes(42);
  const edges = buildEdges(nodes, 2.6);
  for (const [a, b] of edges) {
    assert.ok(a.distanceTo(b) < 2.6);
  }
});
