import { Environment, Float, MeshTransmissionMaterial, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const ContractPage = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const linePositions = useMemo(
    () => [
      [-0.72, 0.76, 1.02],
      [-0.72, 0.52, 1.02],
      [-0.72, 0.28, 1.02],
      [-0.72, 0.04, 1.02],
      [-0.72, -0.2, 1.02],
      [-0.72, -0.44, 1.02],
    ],
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.24, 0.04);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.16, 0.04);
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.35}>
      <group ref={groupRef} rotation={[0.08, -0.22, -0.05]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.85, 2.45, 0.055, 8, 8, 1]} />
          <meshStandardMaterial color="#F5F0E8" roughness={0.35} metalness={0.04} />
        </mesh>

        <mesh position={[0.7, 0.98, 0.05]} rotation={[0, 0, -0.45]}>
          <torusGeometry args={[0.18, 0.01, 12, 56]} />
          <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.18} />
        </mesh>

        {linePositions.map((position, index) => (
          <mesh key={index} position={position as [number, number, number]}>
            <boxGeometry args={[index === 0 ? 0.88 : 1.18, 0.018, 0.018]} />
            <meshStandardMaterial
              color={index === 2 || index === 4 ? '#8B1A1A' : '#23211E'}
              roughness={0.5}
              transparent
              opacity={index === 2 || index === 4 ? 0.85 : 0.46}
            />
          </mesh>
        ))}

        <mesh position={[0, -0.92, 0.07]}>
          <boxGeometry args={[1.36, 0.12, 0.02]} />
          <meshStandardMaterial color="#C9A84C" roughness={0.25} metalness={0.5} />
        </mesh>

        <mesh position={[0, 0, 0.14]}>
          <boxGeometry args={[2.08, 2.72, 0.018]} />
          <MeshTransmissionMaterial
            anisotropicBlur={0.2}
            chromaticAberration={0.04}
            distortion={0.18}
            distortionScale={0.18}
            temporalDistortion={0.08}
            thickness={0.28}
            roughness={0.06}
            transmission={0.88}
            color="#E8DDCC"
            attenuationColor="#C9A84C"
            attenuationDistance={1.2}
            transparent
            opacity={0.28}
          />
        </mesh>
      </group>
    </Float>
  );
};

const HeroScene = () => {
  return (
    <Canvas shadows dpr={[1, 1.8]} className="h-full w-full">
      <PerspectiveCamera makeDefault position={[0, 0, 5.2]} fov={38} />
      <color attach="background" args={['#070707']} />
      <ambientLight intensity={0.45} />
      <spotLight position={[1.2, 2.4, 3]} intensity={5.4} angle={0.38} penumbra={0.8} color="#C9A84C" castShadow />
      <pointLight position={[-2, -1.8, 2.6]} intensity={1.2} color="#8B1A1A" />
      <ContractPage />
      <Environment preset="city" />
    </Canvas>
  );
};

export default HeroScene;
