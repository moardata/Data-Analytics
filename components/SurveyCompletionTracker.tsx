'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SurveyCompletionTrackerProps {
  onComplete: () => void;
}

export function triggerConfetti() {
  const duration = 4000;
  const animationEnd = Date.now() + duration;
  
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Initial big burst
  confetti({
    particleCount: 150,
    spread: 120,
    origin: { y: 0.6 },
    colors: ['#10B981', '#0E9F71', '#34D399', '#6EE7B7', '#A7F3D0']
  });

  // Continuous confetti
  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Launch confetti from different positions
    confetti({
      particleCount,
      startVelocity: 35,
      spread: 360,
      ticks: 80,
      zIndex: 10000,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#10B981', '#0E9F71', '#34D399', '#6EE7B7', '#A7F3D0', '#FFD700', '#FFA500']
    });
    confetti({
      particleCount,
      startVelocity: 35,
      spread: 360,
      ticks: 80,
      zIndex: 10000,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#10B981', '#0E9F71', '#34D399', '#6EE7B7', '#A7F3D0', '#FFD700', '#FFA500']
    });
  }, 250);

  // Firework effect
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#10B981', '#FFD700', '#FFA500']
    });
  }, 500);
}

export default function SurveyCompletionTracker({ onComplete }: SurveyCompletionTrackerProps) {
  useEffect(() => {
    // Trigger confetti when component mounts (after successful submission)
    triggerConfetti();
    onComplete();
  }, [onComplete]);

  return null; // This component doesn't render anything
}

