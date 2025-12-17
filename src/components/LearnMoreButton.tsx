'use client';

import { motion } from 'framer-motion';

interface LearnMoreButtonProps {
  className?: string;
}

export default function LearnMoreButton({ className }: LearnMoreButtonProps) {
  const handleClick = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.button
      onClick={handleClick}
      className={className || 'btn-secondary'}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Learn More
    </motion.button>
  );
}
