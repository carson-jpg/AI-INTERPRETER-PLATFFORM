import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import AvatarScene from './AvatarScene';

interface AvatarViewerProps {
  text: string;
  isAnimating: boolean;
  currentSign?: string;
  animationProgress?: number;
}

function ResponsiveCanvas({ children }: { children: React.ReactNode }) {
  const { size, set } = useThree();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 450 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const height = Math.min(width * 1.1, 500);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 50 }}
        style={{ width: dimensions.width, height: dimensions.height }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function AvatarViewer({
  text,
  isAnimating,
  currentSign = 'open_palm',
  animationProgress = 0
}: AvatarViewerProps) {
  const [dimensions, setDimensions] = useState({ width: 400, height: 450 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.avatar-container');
      if (container) {
        const { width } = container.getBoundingClientRect();
        setDimensions({ width, height: Math.min(width * 1.1, 500) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl avatar-container">
      <div className="relative">
        <div style={{ width: '100%', height: dimensions.height }}>
          <Canvas
            camera={{ position: [0, 0.3, 2], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <color attach="background" args={['#1a1a2e']} />
            <fog attach="fog" args={['#1a1a2e', 2, 5]} />
            <Suspense fallback={null}>
              <AvatarScene
                text={text}
                isAnimating={isAnimating}
                currentSign={currentSign}
                animationProgress={animationProgress}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Status indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isAnimating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-white text-sm font-medium">
            {isAnimating ? 'SIGNING' : 'READY'}
          </span>
        </div>

        {/* Current sign label */}
        {currentSign && (
          <div className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white font-bold text-sm uppercase">
              {currentSign.replace('_', ' ')}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-3">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Animation Progress</span>
          <span>{Math.round(animationProgress * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-100" 
            style={{ width: `${animationProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
