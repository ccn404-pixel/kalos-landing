import * as THREE from "three";

export const NODE_COUNT = 24;

export function generateNodes(seed: number): THREE.Vector3[] {
  const nodes: THREE.Vector3[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(
      new THREE.Vector3(
        (rand() - 0.5) * 8,
        (rand() - 0.5) * 5,
        (rand() - 0.5) * 4
      )
    );
  }
  return nodes;
}

export function buildEdges(
  nodes: THREE.Vector3[],
  maxDist: number
): [THREE.Vector3, THREE.Vector3][] {
  const edges: [THREE.Vector3, THREE.Vector3][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) < maxDist) {
        edges.push([nodes[i], nodes[j]]);
      }
    }
  }
  return edges;
}
