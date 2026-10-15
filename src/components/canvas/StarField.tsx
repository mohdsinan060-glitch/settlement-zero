import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
  depth?: number;
}

export function StarField({ count = 2200, depth = 120 }: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorTones = [
      new THREE.Color('#e2e8f0'), // Pale white / bone
      new THREE.Color('#00e5ff'), // Cool cyan
      new THREE.Color('#94a3b8'), // Dim slate
      new THREE.Color('#c4522e'), // Rust accent
      new THREE.Color('#38bdf8'), // Sky cyan
    ];

    for (let i = 0; i < count; i++) {
      // Spherical distribution around camera with depth
      const radius = THREE.MathUtils.randFloat(15, depth);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const tone = colorTones[Math.floor(Math.random() * colorTones.length)];
      col[i * 3] = tone.r;
      col[i * 3 + 1] = tone.g;
      col[i * 3 + 2] = tone.b;
    }

    return [pos, col];
  }, [count, depth]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
      pointsRef.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.4}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
