import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { generateNodes, buildEdges } from "./network-geometry";

function NetworkGroup({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(42), []);
  const edges = useMemo(() => buildEdges(nodes, 2.6), [nodes]);

  useFrame((state, delta) => {
    if (!group.current || reduceMotion) return;
    group.current.rotation.y += delta * 0.05;
    const targetX = state.pointer.y * 0.15;
    const targetY = state.pointer.x * 0.15;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.02;
  });

  return (
    <group ref={group}>
      {edges.map(([a, b], i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#1fe6e6" transparent opacity={0.26} />
        </line>
      ))}
      {nodes.map((n, i) => (
        <group key={i} position={n}>
          <mesh>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshBasicMaterial color="#1fe6e6" transparent opacity={0.08} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color="#7ff2f2" transparent opacity={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export interface HeroSceneProps {
  reduceMotion: boolean;
}

export function HeroScene({ reduceMotion }: HeroSceneProps) {
  if (reduceMotion) {
    // Static frame: render once, no useFrame-driven rotation, no continuous RAF loop.
    return (
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop="demand"
        style={{ position: "absolute", inset: 0 }}
      >
        <NetworkGroup reduceMotion />
      </Canvas>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <NetworkGroup reduceMotion={false} />
    </Canvas>
  );
}
