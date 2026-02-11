import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import AvatarModel from './AvatarModel';

interface AvatarSceneProps {
  text: string;
  isAnimating: boolean;
  currentSign?: string;
  animationProgress?: number;
}

export default function AvatarScene({
  text,
  isAnimating,
  currentSign = 'open_palm',
  animationProgress = 0
}: AvatarSceneProps) {
  const controlsRef = useRef<any>(null);
  const lightIntensity = useMemo(() => Math.max(0.5, animationProgress * 0.5 + 0.5), [animationProgress]);

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0.4, 2.2]} fov={45} />

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minDistance={1.5}
        maxDistance={4}
        target={[0, 0.3, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={0.8 * lightIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={10}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
      <directionalLight
        position={[-2, 2, -2]}
        intensity={0.3 * lightIntensity}
        color="#b0c4de"
      />
      <spotLight
        position={[0, 4, 1]}
        intensity={0.5}
        angle={Math.PI / 4}
        penumbra={0.5}
        color="#fff5e6"
      />

      {/* Environment */}
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 2, 6]} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#252540" />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.54, 0]}
        opacity={0.4}
        scale={3}
        blur={2}
        far={1}
      />

      {/* Avatar */}
      <AvatarModel
        currentSign={currentSign}
        animationProgress={animationProgress}
        isAnimating={isAnimating}
      />
    </>
  );
}
