import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Sign animation configurations
const signAnimations: { [key: string]: {
  leftHand: { fingers: number[]; thumb: number };
  rightHand: { fingers: number[]; thumb: number };
  arms: { left: { shoulder: number; elbow: number }; right: { shoulder: number; elbow: number } };
  head: { tilt: number; turn: number };
} } = {
  'open_palm': {
    leftHand: { fingers: [0, 0, 0, 0, 0], thumb: 0 },
    rightHand: { fingers: [0, 0, 0, 0, 0], thumb: 0 },
    arms: { 
      left: { shoulder: 1.2, elbow: 0.8 }, 
      right: { shoulder: -1.2, elbow: -0.8 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'fist': {
    leftHand: { fingers: [1.5, 1.5, 1.5, 1.5, 1.5], thumb: 1.2 },
    rightHand: { fingers: [1.5, 1.5, 1.5, 1.5, 1.5], thumb: 1.2 },
    arms: { 
      left: { shoulder: 1.0, elbow: 0.5 }, 
      right: { shoulder: -1.0, elbow: -0.5 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'index_extended': {
    leftHand: { fingers: [1.5, 0, 1.5, 1.5, 1.5], thumb: 0.5 },
    rightHand: { fingers: [1.5, 0, 1.5, 1.5, 1.5], thumb: 0.5 },
    arms: { 
      left: { shoulder: 1.1, elbow: 0.6 }, 
      right: { shoulder: -1.1, elbow: -0.6 } 
    },
    head: { tilt: 0, turn: 0.1 }
  },
  'v_shape': {
    leftHand: { fingers: [1.5, 0, 0, 1.5, 1.5], thumb: 0.3 },
    rightHand: { fingers: [1.5, 0, 0, 1.5, 1.5], thumb: 0.3 },
    arms: { 
      left: { shoulder: 1.2, elbow: 0.7 }, 
      right: { shoulder: -1.2, elbow: -0.7 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'flat_b': {
    leftHand: { fingers: [0, 0, 0, 0, 0], thumb: 0.3 },
    rightHand: { fingers: [0, 0, 0, 0, 0], thumb: 0.3 },
    arms: { 
      left: { shoulder: 1.3, elbow: 0.9 }, 
      right: { shoulder: -1.3, elbow: -0.9 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'l_shape': {
    leftHand: { fingers: [0, 0, 1.5, 1.5, 1.5], thumb: 0 },
    rightHand: { fingers: [0, 0, 1.5, 1.5, 1.5], thumb: 0 },
    arms: { 
      left: { shoulder: 1.1, elbow: 0.6 }, 
      right: { shoulder: -1.1, elbow: -0.6 } 
    },
    head: { tilt: 0, turn: 0.1 }
  },
  's_shape': {
    leftHand: { fingers: [1.5, 1.5, 1.5, 1.5, 1.5], thumb: 0.4 },
    rightHand: { fingers: [1.5, 1.5, 1.5, 1.5, 1.5], thumb: 0.4 },
    arms: { 
      left: { shoulder: 0.9, elbow: 0.4 }, 
      right: { shoulder: -0.9, elbow: -0.4 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'g_shape': {
    leftHand: { fingers: [1.5, 0.3, 1.5, 1.5, 1.5], thumb: 0.8 },
    rightHand: { fingers: [1.5, 0.3, 1.5, 1.5, 1.5], thumb: 0.8 },
    arms: { 
      left: { shoulder: 1.0, elbow: 0.5 }, 
      right: { shoulder: -1.0, elbow: -0.5 } 
    },
    head: { tilt: 0, turn: 0.1 }
  },
  'o_shape': {
    leftHand: { fingers: [0.8, 0.8, 0.8, 0.8, 0.8], thumb: 0.6 },
    rightHand: { fingers: [0.8, 0.8, 0.8, 0.8, 0.8], thumb: 0.6 },
    arms: { 
      left: { shoulder: 1.1, elbow: 0.6 }, 
      right: { shoulder: -1.1, elbow: -0.6 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'c_shape': {
    leftHand: { fingers: [0.5, 0.5, 0.5, 0.5, 0.5], thumb: 0.3 },
    rightHand: { fingers: [0.5, 0.5, 0.5, 0.5, 0.5], thumb: 0.3 },
    arms: { 
      left: { shoulder: 1.0, elbow: 0.5 }, 
      right: { shoulder: -1.0, elbow: -0.5 } 
    },
    head: { tilt: 0, turn: 0.1 }
  },
  'a_shape': {
    leftHand: { fingers: [1.5, 1.5, 1.5, 1.5, 1.5], thumb: 0.2 },
    rightHand: { fingers: [1.5, 1.5, 1.5, 1.5, 1.5], thumb: 0.2 },
    arms: { 
      left: { shoulder: 0.8, elbow: 0.3 }, 
      right: { shoulder: -0.8, elbow: -0.3 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'i_shape': {
    leftHand: { fingers: [1.5, 1.5, 1.5, 1.5, 0], thumb: 0.4 },
    rightHand: { fingers: [1.5, 1.5, 1.5, 1.5, 0], thumb: 0.4 },
    arms: { 
      left: { shoulder: 1.2, elbow: 0.7 }, 
      right: { shoulder: -1.2, elbow: -0.7 } 
    },
    head: { tilt: 0.1, turn: 0 }
  },
  't_shape': {
    leftHand: { fingers: [1.5, 0.4, 0.4, 1.5, 1.5], thumb: 0.5 },
    rightHand: { fingers: [1.5, 0.4, 0.4, 1.5, 1.5], thumb: 0.5 },
    arms: { 
      left: { shoulder: 1.0, elbow: 0.5 }, 
      right: { shoulder: -1.0, elbow: -0.5 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'y_shape': {
    leftHand: { fingers: [0, 1.5, 1.5, 1.5, 0], thumb: 0 },
    rightHand: { fingers: [0, 1.5, 1.5, 1.5, 0], thumb: 0 },
    arms: { 
      left: { shoulder: 1.3, elbow: 0.8 }, 
      right: { shoulder: -1.3, elbow: -0.8 } 
    },
    head: { tilt: 0, turn: 0 }
  },
  'default': {
    leftHand: { fingers: [0, 0, 0, 0, 0], thumb: 0 },
    rightHand: { fingers: [0, 0, 0, 0, 0], thumb: 0 },
    arms: { 
      left: { shoulder: 1.1, elbow: 0.6 }, 
      right: { shoulder: -1.1, elbow: -0.6 } 
    },
    head: { tilt: 0, turn: 0 }
  }
};

// Materials
const skinMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FDBF9B'),
  roughness: 0.7,
  metalness: 0.1
});

const shirtMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#2563EB'),
  roughness: 0.8,
  metalness: 0.1
});

const pantsMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#1F2937'),
  roughness: 0.9,
  metalness: 0
});

interface AvatarModelProps {
  currentSign: string;
  animationProgress: number;
  isAnimating: boolean;
}

// Finger component
function Finger({ 
  position, 
  rotation, 
  bend, 
  color = '#FDBF9B' 
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number];
  bend: number;
  color?: string;
}) {
  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.7,
      metalness: 0.1
    }),
  [color]);

  return (
    <group position={position} rotation={rotation}>
      {/* Proximal phalanx */}
      <mesh position={[0, 0.03, 0]} material={material}>
        <capsuleGeometry args={[0.012, 0.03, 4, 8]} />
      </mesh>
      {/* Distal phalanx (bends) */}
      <mesh position={[0, 0.065, 0]} rotation={[bend, 0, 0]} material={material}>
        <capsuleGeometry args={[0.01, 0.025, 4, 8]} />
      </mesh>
    </group>
  );
}

// Hand component
function Hand({ 
  side, 
  fingers, 
  thumbAngle,
  armRotation 
}: { 
  side: 'left' | 'right';
  fingers: number[];
  thumbAngle: number;
  armRotation: { shoulder: number; elbow: number };
}) {
  const handMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FDBF9B'),
      roughness: 0.7,
      metalness: 0.1
    }),
  []);

  const multiplier = side === 'left' ? 1 : -1;
  const fingerNames = ['pinky', 'ring', 'middle', 'index', 'thumb'];

  return (
    <group>
      {/* Upper arm - positioned forward (Z: 0.15) and closer to body (X: ±0.1) */}
      <mesh 
        position={[multiplier * 0.1, 0.25, 0.15]} 
        rotation={[0, 0, armRotation.shoulder * multiplier]}
        material={shirtMaterial}
        castShadow
      >
        <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
      </mesh>

      {/* Forearm - angled toward chest (Z: 0.25, Y: 0.08) */}
      <group 
        position={[multiplier * 0.1, 0.08, 0.25]} 
        rotation={[0, 0, (armRotation.elbow - 0.5) * multiplier]}
      >
        <mesh material={shirtMaterial} castShadow>
          <capsuleGeometry args={[0.035, 0.18, 4, 8]} />
        </mesh>

        {/* Hand palm - positioned at chest level (Y: -0.1, Z: 0.08) */}
        <mesh 
          position={[0, -0.1, 0.08]} 
          rotation={[Math.PI / 2, 0, 0]}
          material={handMaterial}
          castShadow
        >
          <boxGeometry args={[0.06, 0.08, 0.02]} />
        </mesh>

        {/* Fingers */}
        {fingerNames.map((name, i) => {
          const isThumb = name === 'thumb';
          const fingerIndex = isThumb ? 4 : 4 - i;
          const bend = fingers[fingerIndex] || 0;
          
          if (isThumb) {
            return (
              <mesh 
                key={name}
                position={[multiplier * 0.035, -0.1, 0.06]}
                rotation={[0, 0, thumbAngle * multiplier]}
                material={handMaterial}
                castShadow
              >
                <capsuleGeometry args={[0.012, 0.04, 4, 8]} />
              </mesh>
            );
          }

          const xOffset = (i - 1.5) * 0.015 * multiplier;
          const fingerLength = 0.05;
          
          return (
            <group key={name} position={[xOffset, -0.14, 0.06]}>
              <mesh rotation={[bend, 0, 0]} material={handMaterial} castShadow>
                <capsuleGeometry args={[0.01, fingerLength, 4, 8]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export default function AvatarModel({ 
  currentSign, 
  animationProgress,
  isAnimating 
}: AvatarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Get current animation targets
  const animation = signAnimations[currentSign] || signAnimations['default'];
  
  // Current rotation values (for smooth interpolation)
  const currentRotations = useRef({
    leftArm: { shoulder: 0, elbow: 0 },
    rightArm: { shoulder: 0, elbow: 0 },
    head: { tilt: 0, turn: 0 }
  });

  // Animation target values
  const targetRotations = useRef({
    leftArm: { shoulder: animation.arms.left.shoulder, elbow: animation.arms.left.elbow },
    rightArm: { shoulder: animation.arms.right.shoulder, elbow: animation.arms.right.elbow },
    head: { tilt: animation.head.tilt, turn: animation.head.turn }
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth interpolation factor
    const lerpFactor = Math.min(1, delta * 8);
    
    // Update arm rotations
    Object.keys(currentRotations.current.leftArm).forEach((key) => {
      // Left arm
      currentRotations.current.leftArm[key as keyof typeof currentRotations.current.leftArm] = THREE.MathUtils.lerp(
        currentRotations.current.leftArm[key as keyof typeof currentRotations.current.leftArm],
        targetRotations.current.leftArm[key as keyof typeof targetRotations.current.leftArm],
        lerpFactor
      );
      // Right arm
      currentRotations.current.rightArm[key as keyof typeof currentRotations.current.rightArm] = THREE.MathUtils.lerp(
        currentRotations.current.rightArm[key as keyof typeof currentRotations.current.rightArm],
        targetRotations.current.rightArm[key as keyof typeof targetRotations.current.rightArm],
        lerpFactor
      );
    });

    // Update head rotations
    Object.keys(currentRotations.current.head).forEach((key) => {
      currentRotations.current.head[key as keyof typeof currentRotations.current.head] = THREE.MathUtils.lerp(
        currentRotations.current.head[key as keyof typeof currentRotations.current.head],
        targetRotations.current.head[key as keyof typeof targetRotations.current.head],
        lerpFactor
      );
    });

    // Idle animation when not signing
    if (!isAnimating) {
      const time = state.clock.getElapsedTime();
      const idleSway = Math.sin(time * 0.5) * 0.02;
      groupRef.current.rotation.y = idleSway;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Head */}
      <group position={[0, 0.55, 0]}>
        <mesh castShadow material={skinMaterial}>
          <sphereGeometry args={[0.12, 16, 16]} />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.04, 0.02, 0.1]} castShadow>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
        <mesh position={[0.04, 0.02, 0.1]} castShadow>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.04, 0.06, 0.09]} rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.008, 0.025, 4, 8]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
        <mesh position={[0.04, 0.06, 0.09]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.008, 0.025, 4, 8]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.01, 0.12]} castShadow>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#E8B796" />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.05, 0.1]}>
          <capsuleGeometry args={[0.012, 0.025, 4, 8]} />
          <meshStandardMaterial color="#c97878" />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 0.38, 0]} material={skinMaterial} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 0.08, 8]} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.15, 0]} material={shirtMaterial} castShadow>
        <cylinderGeometry args={[0.14, 0.12, 0.35, 8]} />
      </mesh>

      {/* Left Arm */}
      <Hand
        side="left"
        fingers={animation.leftHand.fingers}
        thumbAngle={animation.leftHand.thumb}
        armRotation={{
          shoulder: currentRotations.current.leftArm.shoulder,
          elbow: currentRotations.current.leftArm.elbow
        }}
      />

      {/* Right Arm */}
      <Hand
        side="right"
        fingers={animation.rightHand.fingers}
        thumbAngle={animation.rightHand.thumb}
        armRotation={{
          shoulder: currentRotations.current.rightArm.shoulder,
          elbow: currentRotations.current.rightArm.elbow
        }}
      />

      {/* Lower body */}
      <mesh position={[0, -0.25, 0]} material={pantsMaterial} castShadow>
        <cylinderGeometry args={[0.13, 0.11, 0.3, 8]} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.05, -0.55, 0]} material={pantsMaterial} castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.35, 8]} />
      </mesh>
      <mesh position={[0.05, -0.55, 0]} material={pantsMaterial} castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.35, 8]} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.05, -0.76, 0.02]} castShadow>
        <boxGeometry args={[0.06, 0.03, 0.1]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      <mesh position={[0.05, -0.76, 0.02]} castShadow>
        <boxGeometry args={[0.06, 0.03, 0.1]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
    </group>
  );
}
