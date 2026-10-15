import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function PlanetaryHaze() {
  const hazeRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const count = 450;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const hazeTones = [
      new THREE.Color('#923d2d'), // Muted rust haze
      new THREE.Color('#00e5ff'), // Cyan atmospheric edge
      new THREE.Color('#1e293b'), // Deep slate graphite
      new THREE.Color('#c4522e'), // Warm atmospheric rim
    ];

    for (let i = 0; i < count; i++) {
      // Stratified across horizon curve
      pos[i * 3] = THREE.MathUtils.randFloat(-35, 35);
      pos[i * 3 + 1] = THREE.MathUtils.randFloat(-14, 8);
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(-15, 15);

      const tone = hazeTones[Math.floor(Math.random() * hazeTones.length)];
      col[i * 3] = tone.r;
      col[i * 3 + 1] = tone.g;
      col[i * 3 + 2] = tone.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (hazeRef.current) {
      hazeRef.current.rotation.y += delta * 0.006;
      hazeRef.current.position.y = Math.sin(Date.now() * 0.0004) * 0.4;
    }
  });

  return (
    <points ref={hazeRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={3.2}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.32}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
