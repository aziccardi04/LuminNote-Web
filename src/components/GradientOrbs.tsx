'use client';

import { motion } from 'framer-motion';

export default function GradientOrbs() {
  return (
    <div className="gradient-bg" aria-hidden="true">
      <motion.div
        className="gradient-orb gradient-orb-1"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="gradient-orb gradient-orb-2"
        animate={{
          x: [0, -40, 50, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="gradient-orb gradient-orb-3"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
