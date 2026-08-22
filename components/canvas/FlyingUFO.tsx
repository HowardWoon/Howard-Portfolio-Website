'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FlyingUFO() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  
  // Create randomized parameters for the drone path
  const pathParams = useMemo(() => ({
    speed: 0.1,
    amplitude: 3,
    offset: Math.random() * Math.PI * 2,
    zOffset: -10, // fly in the mid-background
  }), []);

  useFrame((state) => {
    if (!groupRef.current || !coreRef.current || !ring1Ref.current || !ring2Ref.current) return;
    
    const t = state.clock.elapsedTime * pathParams.speed;
    
    // Sine wave flight path across the screen (slow and ominous)
    groupRef.current.position.x = 20 - ((t * 8) % 40);
    groupRef.current.position.y = Math.sin(t + pathParams.offset) * pathParams.amplitude + 5;
    groupRef.current.position.z = pathParams.zOffset;

    // Spin the rings in opposite directions rapidly
    ring1Ref.current.rotation.x += 0.05;
    ring1Ref.current.rotation.y += 0.02;
    
    ring2Ref.current.rotation.x -= 0.03;
    ring2Ref.current.rotation.y -= 0.06;

    // Pulse the core
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    coreRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef}>
      {/* Glowing AI Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
      
      {/* Core Glow */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Gyroscopic Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1, 0.02, 16, 64]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.8} />
      </mesh>

      {/* Gyroscopic Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.2, 0.02, 16, 64]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
