'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!show) return null;

  // Generate confetti pieces
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    rotation: Math.random() * 360,
    color: [
      '#FF69B4', // pink
      '#FFB6C1', // light pink
      '#FFC0CB', // pink
      '#FF1493', // deep pink
      '#C71585', // medium violet red
      '#DA70D6', // orchid
      '#EE82EE', // violet
      '#DDA0DD', // plum
      '#FFD700', // gold
      '#FFA500', // orange
      '#87CEEB', // sky blue
      '#98FB98', // pale green
    ][Math.floor(Math.random() * 12)],
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {/* Confetti pieces */}
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              top: '-10%',
              left: `${piece.left}%`,
              rotate: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              top: '110%',
              rotate: piece.rotation,
              opacity: [1, 1, 0],
              scale: [1, 0.8, 0.5],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'easeIn',
            }}
            style={{
              position: 'absolute',
              width: piece.shape === 'circle' ? '12px' : '10px',
              height: piece.shape === 'circle' ? '12px' : '10px',
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : '2px',
            }}
          />
        ))}

        {/* Celebration text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="text-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
              }}
              className="text-6xl sm:text-8xl mb-4"
            >
              🎉
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-4xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #FF69B4, #FFD700, #87CEEB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255, 105, 180, 0.3)',
              }}
            >
              Amazing Work!
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl mt-2"
              style={{ color: '#FF69B4' }}
            >
              ✨ Task Completed ✨
            </motion.div>
          </div>
        </motion.div>

        {/* Sparkle burst */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{
              opacity: 1,
              scale: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: [1, 0],
              scale: [0, 1.5],
              x: Math.cos((i * Math.PI * 2) / 8) * 150,
              y: Math.sin((i * Math.PI * 2) / 8) * 150,
            }}
            transition={{
              duration: 1,
              delay: 0.2,
            }}
            className="absolute top-1/2 left-1/2 text-4xl"
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
