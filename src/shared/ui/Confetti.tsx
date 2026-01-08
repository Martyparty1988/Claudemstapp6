/**
 * MST Confetti Component - 2026 Edition
 * 
 * Konfetti animace pro oslavy dokončení projektu/milníku.
 */

import React, { useEffect, useState, useCallback } from 'react';

export interface ConfettiProps {
  /** Spustit animaci */
  active: boolean;
  /** Počet částic */
  particleCount?: number;
  /** Délka animace v ms */
  duration?: number;
  /** Barvy konfetti */
  colors?: string[];
  /** Callback po skončení */
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  shape: 'square' | 'circle' | 'triangle' | 'ribbon';
}

const defaultColors = [
  '#0ba5ec', // brand
  '#a855f7', // accent
  '#10b981', // success
  '#f59e0b', // warning
  '#f43f5e', // error
  '#FFD93D', // gold
  '#FF6B6B', // coral
  '#4ECDC4', // teal
];

export function Confetti({
  active,
  particleCount = 100,
  duration = 3000,
  colors = defaultColors,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const shapes: Particle['shape'][] = ['square', 'circle', 'triangle', 'ribbon'];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // % of screen width
        y: -10 - Math.random() * 20, // Start above screen
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        speedX: (Math.random() - 0.5) * 4,
        speedY: 2 + Math.random() * 4,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    
    return newParticles;
  }, [particleCount, colors]);

  useEffect(() => {
    if (active) {
      setParticles(createParticles());
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [active, createParticles, duration, onComplete]);

  // Animation frame
  useEffect(() => {
    if (!isVisible || particles.length === 0) return;

    let animationId: number;
    
    const animate = () => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          y: p.y + p.speedY * 0.5,
          x: p.x + p.speedX * 0.3,
          rotation: p.rotation + p.rotationSpeed,
          speedY: p.speedY + 0.1, // gravity
        })).filter(p => p.y < 120) // Remove off-screen
      );
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isVisible, particles.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'none',
          }}
        >
          <ParticleShape
            shape={particle.shape}
            color={particle.color}
            size={particle.size}
          />
        </div>
      ))}
    </div>
  );
}

function ParticleShape({ 
  shape, 
  color, 
  size 
}: { 
  shape: Particle['shape']; 
  color: string; 
  size: number;
}) {
  switch (shape) {
    case 'circle':
      return (
        <div
          className="rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
        />
      );
    case 'triangle':
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
          }}
        />
      );
    case 'ribbon':
      return (
        <div
          className="rounded-full"
          style={{
            width: size * 0.4,
            height: size * 1.5,
            backgroundColor: color,
          }}
        />
      );
    default: // square
      return (
        <div
          className="rounded-sm"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
          }}
        />
      );
  }
}

/**
 * Hook pro snadné použití konfetti
 */
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const fire = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    fire,
    reset,
    Confetti: (props: Omit<ConfettiProps, 'active' | 'onComplete'>) => (
      <Confetti {...props} active={isActive} onComplete={reset} />
    ),
  };
}

/**
 * Success Celebration - kombinace konfetti a zprávy
 */
export interface CelebrationProps {
  /** Zobrazit oslavu */
  show: boolean;
  /** Titulek */
  title?: string;
  /** Zpráva */
  message?: string;
  /** Callback po zavření */
  onClose?: () => void;
}

export function Celebration({
  show,
  title = '🎉 Gratulujeme!',
  message = 'Skvělá práce!',
  onClose,
}: CelebrationProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);

  const handleComplete = () => {
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 500);
  };

  if (!visible) return null;

  return (
    <>
      <Confetti active={show} onComplete={handleComplete} />
      
      {/* Celebration modal */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleComplete}
        />
        
        <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl animate-bounce-in text-center max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {message}
          </p>
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            Pokračovat
          </button>
        </div>
      </div>
    </>
  );
}

export default Confetti;
