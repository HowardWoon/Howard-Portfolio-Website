'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { fallbackSkills } from '@/lib/site-data';

export default function TechGalaxy({ skills }: { skills: typeof fallbackSkills }) {
  const groupRef = useRef<THREE.Group>(null);

  // Take the first 10 skills to display as planets to avoid clutter
  const topSkills = skills.slice(0, 10);

  const planets = useMemo(() => {
    return topSkills.map((skill, index) => {
      const radius = 3 + index * 0.8;
      const speed = 0.2 + Math.random() * 0.5;
      const angleOffset = Math.random() * Math.PI * 2;
      return { skill, radius, speed, angleOffset };
    });
  }, [topSkills]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Parallax effect based on native scroll
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    groupRef.current.position.y = (scrollY * 0.007) - 10; // Start lower, move up faster than DigitalUniverse

    
    // Rotate the entire galaxy slowly
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {planets.map((planet) => (
        <PlanetOrbit key={planet.skill.name} planet={planet} />
      ))}
      
      {/* Central "Sun" or core of the tech stack */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={2} />
      </mesh>

      <AsteroidBelt />
    </group>
  );
}

function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const asteroidCount = 150;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const asteroids = useMemo(() => {
    const arr = [];
    for (let i = 0; i < asteroidCount; i++) {
      // Create a ring of asteroids between radius 2 and 12
      const radius = 2 + Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2;
      const scale = Math.random() * 0.15 + 0.05;
      const speed = (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
      arr.push({ radius, angle, height, scale, speed });
    }
    return arr;
  }, [asteroidCount]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    asteroids.forEach((asteroid, i) => {
      asteroid.angle += asteroid.speed * 0.05;
      dummy.position.set(
        Math.cos(asteroid.angle) * asteroid.radius,
        asteroid.height + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.2,
        Math.sin(asteroid.angle) * asteroid.radius
      );
      dummy.rotation.x += 0.01;
      dummy.rotation.y += 0.02;
      dummy.scale.set(asteroid.scale, asteroid.scale, asteroid.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, asteroidCount]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#4b5563" roughness={0.8} />
    </instancedMesh>
  );
}

function PlanetOrbit({ planet }: { planet: { skill: { name: string }, radius: number, speed: number, angleOffset: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * planet.speed + planet.angleOffset;
    meshRef.current.position.x = Math.cos(t) * planet.radius;
    meshRef.current.position.z = Math.sin(t) * planet.radius;
  });

  return (
    <group>
      {/* Orbit Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.radius - 0.02, planet.radius + 0.02, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Planet */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#06B6D4" roughness={0.3} metalness={0.8} />
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {planet.skill.name}
          </Text>
        </mesh>
      </Float>
    </group>
  );
}
