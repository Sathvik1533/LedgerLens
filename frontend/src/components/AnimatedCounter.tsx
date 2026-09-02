import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedCounter: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => 
    Math.round(current).toLocaleString('en-IN')
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
};
