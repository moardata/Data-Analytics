'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SurveyCompletionTrackerProps {
  onComplete: () => void;
}

export function triggerConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Launch confetti from different positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

export default function SurveyCompletionTracker({ onComplete }: SurveyCompletionTrackerProps) {
  useEffect(() => {
    // Trigger confetti when component mounts (after successful submission)
    triggerConfetti();
    onComplete();
  }, [onComplete]);

  return null; // This component doesn't render anything
}

