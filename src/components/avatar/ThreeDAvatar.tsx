import { useEffect, useRef, useState } from 'react';
import { textToSignSequence, getWordSignConfig } from '../../services/textToSignMapping';
import AvatarViewer from './AvatarViewer';

interface ThreeDAvatarProps {
  text: string;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

export default function ThreeDAvatar({ text, isAnimating, onAnimationComplete }: ThreeDAvatarProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentSign, setCurrentSign] = useState('open_palm');
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const words = text.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
  const signSequence = textToSignSequence(text);

  useEffect(() => {
    if (!isAnimating || words.length === 0) {
      if (!isAnimating && words.length === 0) {
        setCurrentSign('open_palm');
        setAnimationProgress(0);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const signDuration = 2000; // 2 seconds per word
      const totalDuration = words.length * signDuration;

      if (elapsed >= totalDuration) {
        setAnimationProgress(1);
        setCurrentWordIndex(words.length - 1);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        return;
      }

      const newWordIndex = Math.min(Math.floor(elapsed / signDuration), words.length - 1);
      const wordProgress = (elapsed % signDuration) / signDuration;

      setCurrentWordIndex(newWordIndex);
      setAnimationProgress(wordProgress);

      // Update current sign based on word
      const currentWord = words[newWordIndex];
      const signConfig = getWordSignConfig(currentWord);
      setCurrentSign(signConfig?.handShape || 'open_palm');

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, words, onAnimationComplete]);

  // Reset when text changes
  useEffect(() => {
    if (!isAnimating) {
      setCurrentWordIndex(0);
      setAnimationProgress(0);
      startTimeRef.current = null;
      if (words.length > 0) {
        const signConfig = getWordSignConfig(words[0]);
        setCurrentSign(signConfig?.handShape || 'open_palm');
      }
    }
  }, [text, isAnimating, words]);

  return (
    <AvatarViewer
      text={text}
      isAnimating={isAnimating}
      currentSign={currentSign}
      animationProgress={animationProgress}
    />
  );
}
