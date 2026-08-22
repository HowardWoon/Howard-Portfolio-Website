'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Meteors() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Dramatically reduce count to make it organized and rare
  const meteorCount = 5;

  const meteors = useMemo(() => {
    const arr = [];
    for (let i = 0; i < meteorCount; i++) {
      arr.push({
        x: 20 + Math.random() * 50, // Start far top right
        y: 20 + Math.random() * 50,
        z: -10 - Math.random() * 20, // Keep in background
        speed: 1.0 + Math.random() * 0.5, // Fast speed
        length: 2 + Math.random() * 3, // Long elegant tails
        delay: Math.random() * 100, // Stagger them so they don't all fall at once
      });
    }
    return arr;
  }, [meteorCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    meteors.forEach((meteor, i) => {
      // Delay countdown before shooting
      if (meteor.delay > 0) {
        meteor.delay -= 1;
        // Keep it hidden far away while delaying
        dummy.position.set(1000, 1000, 1000);
      } else {
        // Move diagonally down-left sharply
        meteor.x -= meteor.speed;
        meteor.y -= meteor.speed;

        // Reset if out of bounds to simulate occasional shooting stars
        if (meteor.x < -30 || meteor.y < -30) {
          meteor.x = 30 + Math.random() * 30;
          meteor.y = 30 + Math.random() * 30;
          meteor.z = -10 - Math.random() * 20;
          meteor.speed = 1.0 + Math.random() * 0.5;
          meteor.delay = 100 + Math.random() * 300; // Wait a few seconds before firing again
        }

        dummy.position.set(meteor.x, meteor.y, meteor.z);
      }

      // Rotate cylinder to exactly match the 45-degree angle of descent
      dummy.rotation.z = Math.PI / 4; 
      dummy.scale.set(0.02, meteor.length, 0.02); // Thin, long, elegant
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    // @ts-expect-error args tuple allows null for geometry and material
    <instancedMesh ref={meshRef} args={[null, null, meteorCount]}>
      <cylinderGeometry args={[1, 0, 1, 8]} /> {/* Tapered end for a tail effect */}
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}
