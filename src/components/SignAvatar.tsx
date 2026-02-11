
import { useEffect, useRef, useState } from 'react';
import { textToSignSequence } from '../services/textToSignMapping';

interface SignAvatarProps {
  text: string;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

// Very simple, large hand shapes that are highly visible
function getHandShape(handShape: string): { fingers: number[][][]; palm: number[] } {
  // Normalized coordinates (0-1 range), centered at 0.5, 0.5
  
  const shapes: { [key: string]: { fingers: number[][][]; palm: number[] } } = {
    'open_palm': {
      palm: [0.5, 0.65],
      fingers: [
        // Thumb
        [[0.35, 0.6], [0.28, 0.48], [0.24, 0.36], [0.22, 0.24]],
        // Index
        [[0.42, 0.6], [0.4, 0.42], [0.38, 0.28], [0.36, 0.16]],
        // Middle
        [[0.5, 0.58], [0.5, 0.4], [0.5, 0.25], [0.5, 0.12]],
        // Ring
        [[0.58, 0.6], [0.6, 0.42], [0.62, 0.28], [0.64, 0.16]],
        // Pinky
        [[0.7, 0.62], [0.72, 0.48], [0.74, 0.36], [0.76, 0.26]]
      ]
    },
    'fist': {
      palm: [0.5, 0.6],
      fingers: [
        [[0.38, 0.58], [0.36, 0.52], [0.34, 0.46], [0.32, 0.4]],
        [[0.44, 0.58], [0.44, 0.52], [0.44, 0.46], [0.44, 0.4]],
        [[0.5, 0.58], [0.5, 0.52], [0.5, 0.46], [0.5, 0.4]],
        [[0.56, 0.58], [0.56, 0.52], [0.56, 0.46], [0.56, 0.4]],
        [[0.68, 0.6], [0.68, 0.54], [0.68, 0.48], [0.68, 0.42]]
      ]
    },
    'index_extended': {
      palm: [0.5, 0.62],
      fingers: [
        [[0.38, 0.58], [0.34, 0.5], [0.3, 0.42], [0.28, 0.34]],
        [[0.44, 0.58], [0.44, 0.42], [0.44, 0.28], [0.44, 0.14]],
        [[0.5, 0.58], [0.5, 0.52], [0.5, 0.46], [0.5, 0.4]],
        [[0.56, 0.58], [0.56, 0.52], [0.56, 0.46], [0.56, 0.4]],
        [[0.68, 0.6], [0.68, 0.54], [0.68, 0.48], [0.68, 0.42]]
      ]
    },
    'v_shape': {
      palm: [0.5, 0.62],
      fingers: [
        [[0.38, 0.58], [0.34, 0.5], [0.3, 0.42], [0.28, 0.34]],
        [[0.44, 0.58], [0.42, 0.4], [0.4, 0.24], [0.38, 0.1]],
        [[0.5, 0.58], [0.5, 0.4], [0.5, 0.24], [0.5, 0.08]],
        [[0.56, 0.58], [0.56, 0.52], [0.56, 0.46], [0.56, 0.4]],
        [[0.68, 0.6], [0.68, 0.54], [0.68, 0.48], [0.68, 0.42]]
      ]
    },
    'flat_b': {
      palm: [0.5, 0.62],
      fingers: [
        [[0.32, 0.56], [0.26, 0.44], [0.22, 0.32], [0.2, 0.2]],
        [[0.4, 0.58], [0.36, 0.42], [0.32, 0.28], [0.3, 0.14]],
        [[0.5, 0.58], [0.5, 0.4], [0.5, 0.24], [0.5, 0.08]],
        [[0.6, 0.58], [0.64, 0.42], [0.68, 0.28], [0.7, 0.14]],
        [[0.72, 0.6], [0.76, 0.48], [0.78, 0.38], [0.8, 0.28]]
      ]
    },
    'l_shape': {
      palm: [0.5, 0.62],
      fingers: [
        [[0.28, 0.54], [0.2, 0.44], [0.14, 0.34], [0.1, 0.24]],
        [[0.44, 0.58], [0.44, 0.42], [0.44, 0.28], [0.44, 0.14]],
        [[0.5, 0.58], [0.5, 0.52], [0.5, 0.46], [0.5, 0.4]],
        [[0.56, 0.58], [0.56, 0.52], [0.56, 0.46], [0.56, 0.4]],
        [[0.68, 0.6], [0.68, 0.54], [0.68, 0.48], [0.68, 0.42]]
      ]
    },
    's_shape': {
      palm: [0.5, 0.6],
      fingers: [
        [[0.44, 0.54], [0.42, 0.5], [0.4, 0.46], [0.4, 0.42]],
        [[0.44, 0.58], [0.44, 0.52], [0.44, 0.47], [0.44, 0.42]],
        [[0.5, 0.58], [0.5, 0.52], [0.5, 0.47], [0.5, 0.42]],
        [[0.56, 0.58], [0.56, 0.52], [0.56, 0.47], [0.56, 0.42]],
        [[0.68, 0.6], [0.68, 0.55], [0.68, 0.5], [0.68, 0.45]]
      ]
    },
    'g_shape': {
      palm: [0.5, 0.62],
      fingers: [
        [[0.48, 0.52], [0.46, 0.46], [0.44, 0.4], [0.44, 0.34]],
        [[0.44, 0.58], [0.44, 0.42], [0.44, 0.28], [0.44, 0.14]],
        [[0.5, 0.58], [0.5, 0.52], [0.5, 0.46], [0.5, 0.4]],
        [[0.56, 0.58], [0.56, 0.52], [0.56, 0.46], [0.56, 0.4]],
        [[0.68, 0.6], [0.68, 0.54], [0.68, 0.48], [0.68, 0.42]]
      ]
    },
    'o_shape': {
      palm: [0.5, 0.6],
      fingers: [
        [[0.46, 0.54], [0.47, 0.5], [0.48, 0.46], [0.47, 0.42]],
        [[0.46, 0.58], [0.47, 0.52], [0.47, 0.47], [0.46, 0.42]],
        [[0.5, 0.58], [0.5, 0.52], [0.5, 0.47], [0.5, 0.42]],
        [[0.54, 0.58], [0.53, 0.52], [0.53, 0.47], [0.54, 0.42]],
        [[0.68, 0.6], [0.66, 0.55], [0.64, 0.5], [0.63, 0.45]]
      ]
    },
    'default': {
      palm: [0.5, 0.62],
      fingers: [
        [[0.38, 0.58], [0.34, 0.5], [0.3, 0.42], [0.28, 0.34]],
        [[0.44, 0.58], [0.42, 0.42], [0.4, 0.28], [0.38, 0.16]],
        [[0.5, 0.58], [0.5, 0.4], [0.5, 0.25], [0.5, 0.12]],
        [[0.56, 0.58], [0.58, 0.42], [0.6, 0.28], [0.62, 0.16]],
        [[0.68, 0.6], [0.7, 0.48], [0.72, 0.38], [0.73, 0.28]]
      ]
    }
  };
  
  return shapes[handShape] || shapes['default'];
}

function SignAvatar({ text, isAnimating, onAnimationComplete }: SignAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const signSequence = textToSignSequence(text);
  const words = text.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);

  function getSignColor(word: string): string {
    return '#00ff88'; // Bright green for maximum visibility
  }

  // Draw very large, simple, highly visible hands
  function drawBigHands(ctx: CanvasRenderingContext2D, time: number, width: number, height: number, handShape: string, signLabel: string) {
    const scale = Math.min(width, height) * 0.85;
    const centerX = width / 2;
    const baseY = height * 0.55;
    
    const shape = getHandShape(handShape);
    const palm = shape.palm;
    const fingers = shape.fingers;
    
    // Very bright white background for hands
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - scale * 0.55, baseY - scale * 0.35, scale * 1.1, scale * 0.9);
    
    // Thick black outline for visibility
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    
    // Draw palm as large oval
    ctx.beginPath();
    ctx.ellipse(
      centerX + (palm[0] - 0.5) * scale,
      baseY + (palm[1] - 0.6) * scale,
      scale * 0.18,
      scale * 0.25,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = '#00ccff'; // Bright blue palm
    ctx.fill();
    ctx.stroke();
    
    // Draw each finger as thick tube with rounded end
    const fingerColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff'];
    
    fingers.forEach((finger, i) => {
      // Draw thick finger line
      ctx.beginPath();
      ctx.moveTo(centerX + (palm[0] - 0.5) * scale, baseY + (palm[1] - 0.6) * scale);
      finger.forEach(point => {
        ctx.lineTo(centerX + (point[0] - 0.5) * scale, baseY + (point[1] - 0.6) * scale);
      });
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = scale * 0.1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Draw finger on top with bright color
      ctx.beginPath();
      ctx.moveTo(centerX + (palm[0] - 0.5) * scale, baseY + (palm[1] - 0.6) * scale);
      finger.forEach((point, j) => {
        ctx.lineTo(centerX + (point[0] - 0.5) * scale, baseY + (point[1] - 0.6) * scale);
      });
      ctx.strokeStyle = fingerColors[i];
      ctx.lineWidth = scale * 0.08;
      ctx.stroke();
      
      // Draw fingertip as large circle
      const tip = finger[finger.length - 1];
      ctx.beginPath();
      ctx.arc(
        centerX + (tip[0] - 0.5) * scale,
        baseY + (tip[1] - 0.6) * scale,
        scale * 0.08,
        0, Math.PI * 2
      );
      ctx.fillStyle = fingerColors[i];
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    
    // Draw palm center
    ctx.beginPath();
    ctx.arc(
      centerX + (palm[0] - 0.5) * scale,
      baseY + (palm[1] - 0.6) * scale,
      scale * 0.1,
      0, Math.PI * 2
    );
    ctx.fillStyle = '#00ccff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Animation loop
  useEffect(() => {
    if (!isAnimating || signSequence.length === 0) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const width = canvasRef.current.width;
          const height = canvasRef.current.height;
          
          // Black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
          
          // Title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('SIGN LANGUAGE', width / 2, 45);
          
          // Draw hands
          drawBigHands(ctx, Date.now(), width, height, 'open_palm', '');
          
          // Word
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 56px Arial';
          ctx.fillText('WAITING...', width / 2, height - 40);
          
          // Subtitle
          ctx.fillStyle = '#00ff88';
          ctx.font = '20px Arial';
          ctx.fillText('Speak or type to see signs', width / 2, height - 12);
        }
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const signDuration = 2000;
      const totalDuration = signSequence.length * signDuration;
      
      if (elapsed >= totalDuration) {
        setProgress(100);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        return;
      }

      const newSignIndex = Math.floor(elapsed / signDuration);
      const signProgress = (elapsed % signDuration) / signDuration;
      
      if (newSignIndex !== currentSignIndex) {
        setCurrentSignIndex(newSignIndex);
        if (words[newSignIndex]) {
          setCurrentWord(words[newSignIndex]);
        }
      }
      setProgress(signProgress * 100);

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const width = canvasRef.current.width;
          const height = canvasRef.current.height;
          
          // Black background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
          
          // Title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('SIGN LANGUAGE TRANSLATION', width / 2, 40);
          
          // Current word - VERY LARGE
          ctx.fillStyle = '#00ff88';
          const word = words[newSignIndex] || 'hello';
          ctx.font = 'bold 72px Arial';
          ctx.fillText(word.toUpperCase(), width / 2, height - 50);
          
          // Draw hands
          const currentSignConfig = signSequence[newSignIndex];
          const handShape = currentSignConfig?.handShape || 'open_palm';
          drawBigHands(ctx, timestamp, width, height, handShape, word);
          
          // Progress indicator
          const barWidth = width * 0.6;
          ctx.fillStyle = '#333333';
          ctx.fillRect((width - barWidth) / 2, 60, barWidth, 8);
          ctx.fillStyle = '#00ff88';
          ctx.fillRect((width - barWidth) / 2, 60, barWidth * ((newSignIndex + signProgress) / Math.max(words.length, 1)), 8);
          
          // Word count
          ctx.fillStyle = '#888888';
          ctx.font = '16px Arial';
          ctx.fillText(`${newSignIndex + 1} / ${words.length} words`, width / 2, 95);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, signSequence.length, onAnimationComplete, words, currentSignIndex]);

  useEffect(() => {
    setCurrentSignIndex(0);
    setProgress(0);
    setCurrentWord('');
    startTimeRef.current = null;
  }, [text, words]);

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={450}
          className="w-full h-auto block"
          style={{ aspectRatio: '8/9' }}
        />

        {/* Status */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isAnimating ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-white text-sm font-medium">{isAnimating ? 'LIVE' : 'STANDBY'}</span>
        </div>

        {/* Current word */}
        {currentWord && (
          <div className="absolute top-4 right-4 bg-green-500 px-4 py-2 rounded-lg">
            <p className="text-black font-bold text-lg">{currentWord.toUpperCase()}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-gray-900 px-4 py-3">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-100" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default SignAvatar;
