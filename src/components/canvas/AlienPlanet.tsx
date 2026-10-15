import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Planet surface vertex and fragment shader with procedural noise & atmospheric rim
const PlanetSurfaceShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    uniform vec3 uLightDirection;
    uniform float uTime;

    // Simple 3D noise functions for procedural terrain
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 p) {
      float total = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        total += snoise(p) * amplitude;
        p *= 2.02;
        amplitude *= 0.5;
      }
      return total;
    }

    void main() {
      // Coordinate on sphere
      vec3 p = normalize(vPosition);

      // Procedural terrain height via multi-octave noise
      float elevation = fbm(p * 3.5 + vec3(0.0, uTime * 0.005, 0.0));
      float detail = fbm(p * 9.0);

      // Color ramps: graphite bedrock, rust-red mineral plateaus, dark basalt basins
      vec3 basalt = vec3(0.04, 0.06, 0.09);      // Deep graphite black
      vec3 bedrock = vec3(0.10, 0.13, 0.17);     // Cool dark rocky stone
      vec3 rustRidge = vec3(0.48, 0.18, 0.12);   // Muted rust-red planetary terrain
      vec3 rustBright = vec3(0.72, 0.31, 0.18);  // Sunlit oxidized iron highlands
      vec3 cyanIce = vec3(0.05, 0.28, 0.35);     // Subsurface ice sheen

      vec3 albedo = mix(basalt, bedrock, smoothstep(-0.4, 0.1, elevation));
      albedo = mix(albedo, rustRidge, smoothstep(0.1, 0.45, elevation + detail * 0.2));
      albedo = mix(albedo, rustBright, smoothstep(0.45, 0.75, elevation));

      // Ice/mineral pockets in deepest basins
      if (elevation < -0.25) {
        albedo = mix(albedo, cyanIce, smoothstep(-0.4, -0.25, elevation));
      }

      // Directional Sun lighting with smooth terminator
      vec3 lightDir = normalize(uLightDirection);
      float diff = max(dot(vNormal, lightDir), 0.0);
      float terminator = smoothstep(-0.15, 0.2, dot(vNormal, lightDir));

      // Atmospheric rim / Fresnel glow
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      float rim = pow(fresnel, 3.2);

      // Rim light color: cyan on dark side, warm amber/rust on sunlit limb
      vec3 sunlitRim = vec3(0.85, 0.42, 0.22);
      vec3 darkRim = vec3(0.0, 0.75, 0.95);
      vec3 rimColor = mix(darkRim * 0.6, sunlitRim, max(dot(vNormal, lightDir) * 0.5 + 0.5, 0.0));

      vec3 finalColor = albedo * (diff * 1.1 + 0.06) * terminator;
      finalColor += rimColor * rim * 1.4;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Atmospheric Glow Outer Shell
const AtmosphereGlowShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform vec3 uLightDirection;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      float glow = pow(fresnel, 4.5);

      vec3 lightDir = normalize(uLightDirection);
      float sunFacing = max(dot(vNormal, lightDir) * 0.5 + 0.5, 0.0);

      vec3 rimColor = mix(vec3(0.0, 0.65, 0.95), vec3(0.95, 0.45, 0.2), sunFacing);

      gl_FragColor = vec4(rimColor, glow * 0.85);
    }
  `
};

export function AlienPlanet() {
  const planetRef = useRef<THREE.Mesh>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      uLightDirection: { value: new THREE.Vector3(20, 15, 10).normalize() },
      uTime: { value: 0 },
    }),
    []
  );

  const glowUniforms = useMemo(
    () => ({
      uLightDirection: { value: new THREE.Vector3(20, 15, 10).normalize() },
    }),
    []
  );

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.02;
      uniforms.uTime.value += delta;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group position={[4, -6, -8]}>
      {/* Primary Planet Sphere */}
      <mesh ref={planetRef} scale={18}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={PlanetSurfaceShader.vertexShader}
          fragmentShader={PlanetSurfaceShader.fragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmospheric Rim Halo */}
      <mesh ref={atmosphereRef} scale={18.6}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          vertexShader={AtmosphereGlowShader.vertexShader}
          fragmentShader={AtmosphereGlowShader.fragmentShader}
          uniforms={glowUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
