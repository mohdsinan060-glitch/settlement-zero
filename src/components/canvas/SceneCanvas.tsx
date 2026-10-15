import { Suspense, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './CameraRig';
import { AlienPlanet } from './AlienPlanet';
import { DistantMoon } from './DistantMoon';
import { PlanetaryHaze } from './PlanetaryHaze';
import { CrashedShip } from './CrashedShip';

interface SceneCanvasProps {
  children?: ReactNode;
}

export function SceneCanvas({ children }: SceneCanvasProps) {
  return (
    <div id="gl" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 2.5, 26], fov: 45, near: 0.1, far: 1000 }}
        dpr={[1, 1.25]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <color attach="background" args={['#020408']} />

        {/* Cinematic Dual-Tone Lighting: Cool key light & warm atmospheric fill */}
        <ambientLight intensity={0.35} color="#0c1824" />
        <directionalLight position={[24, 18, 12]} intensity={1.4} color="#f8fafc" />
        <directionalLight position={[-16, -12, -6]} intensity={0.65} color="#c4522e" />

        {/* Smooth Waypoint Camera Choreography */}
        <CameraRig />

        <Suspense fallback={null}>
          {/* Starfield passed from App */}
          {children}

          {/* Deep celestial scale */}
          <DistantMoon />

          {/* The Hero Alien Exoplanet */}
          <AlienPlanet />

          {/* Layered Horizon Haze */}
          <PlanetaryHaze />

          {/* Foreground Horizon Colony Ship Wreckage */}
          <CrashedShip />
        </Suspense>
      </Canvas>
    </div>
  );
}
