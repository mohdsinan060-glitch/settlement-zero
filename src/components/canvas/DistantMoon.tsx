import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DistantMoon() {
  const groupRef = useRef<THREE.Group>(null!);
  const moonRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <group ref={groupRef} position={[-28, 16, -42]}>
      {/* Distant Planet Sphere */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.8}
          metalness={0.2}
          emissive="#0f172a"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Planetary Rings */}
      <mesh rotation={[-Math.PI / 3.2, Math.PI / 8, 0]}>
        <ringGeometry args={[5.2, 9.8, 64]} />
        <meshStandardMaterial
          color="#64748b"
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
          roughness={0.7}
        />
      </mesh>

      {/* Secondary Outer Thin Ring */}
      <mesh rotation={[-Math.PI / 3.2, Math.PI / 8, 0]}>
        <ringGeometry args={[10.4, 11.6, 64]} />
        <meshStandardMaterial
          color="#94a3b8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}
