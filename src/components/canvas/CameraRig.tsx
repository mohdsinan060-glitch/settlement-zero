import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Waypoint {
  pos: THREE.Vector3;
  target: THREE.Vector3;
}

export function CameraRig() {
  const { camera } = useThree();

  const scrollProgress = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const currentTarget = useRef(new THREE.Vector3(1.5, -2, 0));
  const prefersReducedMotion = useRef(false);

  // Define camera waypoints for scroll-driven descent
  const waypoints = useRef<Waypoint[]>([
    // 0: Orbital Arrival — High orbit, majestic planet view
    {
      pos: new THREE.Vector3(0, 2.5, 26),
      target: new THREE.Vector3(1.5, -2, 0),
    },
    // 1: Crash Site — Descent toward surface ridge & Arcadia-9 wreckage
    {
      pos: new THREE.Vector3(-3.2, -4.5, 13.5),
      target: new THREE.Vector3(-4.8, -5.6, 4.0),
    },
    // 2: Planetary Exploration — Scanning terrain elevation
    {
      pos: new THREE.Vector3(1.2, -5.8, 15.0),
      target: new THREE.Vector3(0.5, -6.8, 0.0),
    },
    // 3: Life Support Emergency — Atmospheric distress focus
    {
      pos: new THREE.Vector3(-1.8, -6.5, 14.0),
      target: new THREE.Vector3(-3.0, -6.2, 2.0),
    },
    // 4: Command Center — Strategic wide operational survey
    {
      pos: new THREE.Vector3(0, -4.2, 20.0),
      target: new THREE.Vector3(0, -5.0, 0.0),
    },
  ]);

  useEffect(() => {
    // Check reduced motion
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        scrollProgress.current = Math.min(1, Math.max(0, window.scrollY / totalScroll));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion.current) return;
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame((_, delta) => {
    const p = scrollProgress.current;
    const pts = waypoints.current;
    const numSegments = pts.length - 1;
    const scaledProgress = p * numSegments;
    const index = Math.min(Math.floor(scaledProgress), numSegments - 1);
    const fraction = scaledProgress - index;

    // Smoothly interpolate between adjacent waypoints
    const wpA = pts[index];
    const wpB = pts[index + 1] || wpA;

    const targetPos = new THREE.Vector3().lerpVectors(wpA.pos, wpB.pos, fraction);
    const targetLook = new THREE.Vector3().lerpVectors(wpA.target, wpB.target, fraction);

    // Apply gentle mouse parallax sway if reduced motion is disabled
    if (!prefersReducedMotion.current) {
      targetPos.x += mouse.current.x * 0.45;
      targetPos.y -= mouse.current.y * 0.35;
    }

    // Damp camera position and lookAt target for cinematic fluidity
    const lerpFactor = Math.min(1, delta * 2.8);
    camera.position.lerp(targetPos, lerpFactor);
    currentTarget.current.lerp(targetLook, lerpFactor);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
