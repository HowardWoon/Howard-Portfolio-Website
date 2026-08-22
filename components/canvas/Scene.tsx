'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import DigitalUniverse from './DigitalUniverse';
import TechGalaxy from './TechGalaxy';
import Meteors from './Meteors';
import FlyingUFO from './FlyingUFO';
import { fallbackExperiences, fallbackProfile, fallbackProjects, fallbackSkills } from '@/lib/site-data';

// Add props type to match what we pass from page.tsx
type SceneProps = {
  profile: typeof fallbackProfile;
  experiences: typeof fallbackExperiences;
  projects: typeof fallbackProjects;
  skills: typeof fallbackSkills;
};

function AnimatedStars() {
  const starsRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      starsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });
  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1.5} />
    </group>
  );
}

export default function Scene({ skills }: { skills: typeof fallbackSkills }) {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#0A0A0A']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Suspense fallback={null}>
          <AnimatedStars />
          <Meteors />
          <FlyingUFO />
          
          <DigitalUniverse />
          <TechGalaxy skills={skills} />
        </Suspense>
      </Canvas>
    </div>
  );
}
