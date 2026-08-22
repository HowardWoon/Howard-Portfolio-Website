'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function DigitalUniverse() {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  // Generate particles
  const particlesCount = 2000;
  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    const scales = new Float32Array(particlesCount);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random();
    }
    return [positions, scales];
  }, [particlesCount]);

  useFrame((state) => {
    if (!groupRef.current || !sphereRef.current) return;
    
    // Parallax effect based on native scroll
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    groupRef.current.position.y = scrollY * 0.005;
    
    // Gentle rotation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    sphereRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;

    // Make particles slowly drift
    const pointsMesh = groupRef.current.children[1] as THREE.Points;
    if (pointsMesh) {
      pointsMesh.rotation.z = state.clock.elapsedTime * 0.02;
    }
    
    // Mouse interactive rotation for the main sphere
    const mouseX = (state.pointer.x * Math.PI) / 4;
    const mouseY = (state.pointer.y * Math.PI) / 4;
    sphereRef.current.rotation.y += (mouseX - sphereRef.current.rotation.y) * 0.1;
    sphereRef.current.rotation.x += (mouseY - sphereRef.current.rotation.x) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Central Holographic Sphere */}
      <Sphere ref={sphereRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#6366F1"
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.3}
          transmission={0.9}
          thickness={0.5}
        />
      </Sphere>

      {/* Floating Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-scale"
            args={[scales, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#06B6D4"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
