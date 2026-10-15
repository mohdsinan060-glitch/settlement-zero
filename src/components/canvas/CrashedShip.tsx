import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CrashedShip() {
  const beaconRef = useRef<THREE.PointLight>(null!);
  const beaconMeshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Subtle rhythmic emergency beacon pulse
    const pulse = (Math.sin(t * 2.2) + 1) * 0.5;
    if (beaconRef.current) {
      beaconRef.current.intensity = 0.4 + pulse * 1.8;
    }
    if (beaconMeshRef.current) {
      const mat = beaconMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + pulse * 0.7;
    }
  });

  return (
    <group position={[-5.5, -6.8, 6]} rotation={[0.15, 0.45, -0.1]}>
      {/* Basalt Ridge Foundation */}
      <mesh position={[0, -0.6, 0]} rotation={[-0.1, 0.2, 0]}>
        <dodecahedronGeometry args={[2.8, 1]} />
        <meshStandardMaterial
          color="#080c12"
          roughness={0.95}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* Secondary Jagged Crag */}
      <mesh position={[2.2, -0.9, 0.5]} rotation={[0.3, -0.4, 0.2]}>
        <octahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#06090e"
          roughness={0.9}
          metalness={0.15}
          flatShading
        />
      </mesh>

      {/* Main Fractured Fuselage (Arcadia-9) */}
      <mesh position={[-0.4, 0.4, 0]} rotation={[0.25, -0.3, 0.35]}>
        <coneGeometry args={[1.4, 4.6, 5]} />
        <meshStandardMaterial
          color="#111822"
          roughness={0.7}
          metalness={0.4}
          flatShading
        />
      </mesh>

      {/* Scorched Heat Shield Under-belly */}
      <mesh position={[-0.5, 0.1, -0.1]} rotation={[0.25, -0.3, 0.35]}>
        <coneGeometry args={[1.35, 4.4, 4]} />
        <meshStandardMaterial
          color="#22120e"
          roughness={0.9}
          metalness={0.2}
          flatShading
        />
      </mesh>

      {/* Snapped Structural Trusswork / Spar */}
      <mesh position={[0.7, 1.8, 0.2]} rotation={[0.6, 0.2, -0.5]}>
        <cylinderGeometry args={[0.06, 0.08, 3.2, 6]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.6}
          metalness={0.7}
        />
      </mesh>

      {/* Damaged Solar Wing Fragment */}
      <mesh position={[1.4, 1.2, 0.6]} rotation={[0.4, 0.5, -0.3]}>
        <boxGeometry args={[1.6, 0.04, 0.9]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.5}
          metalness={0.6}
          emissive="#0369a1"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Smoldering Engine Nacelle with Cooling Thermal Glow */}
      <mesh position={[-1.2, -0.6, 0.3]} rotation={[0.2, 0.8, -0.2]}>
        <cylinderGeometry args={[0.45, 0.6, 1.2, 8]} />
        <meshStandardMaterial
          color="#1e1b18"
          roughness={0.8}
          metalness={0.3}
          emissive="#7f1d1d"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Emergency Transponder Mast */}
      <mesh position={[0.2, 2.2, 0.1]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Pulsing Emergency Beacon */}
      <mesh ref={beaconMeshRef} position={[0.2, 2.7, 0.1]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#00e5ff" transparent />
      </mesh>
      <pointLight
        ref={beaconRef}
        position={[0.2, 2.7, 0.1]}
        color="#00e5ff"
        distance={7}
        decay={2}
      />

      {/* Secondary Warning Ember on Fractured Core */}
      <pointLight
        position={[-1.2, -0.6, 0.3]}
        color="#f97316"
        intensity={0.4}
        distance={4}
        decay={2}
      />
    </group>
  );
}
