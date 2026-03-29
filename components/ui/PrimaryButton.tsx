
import React from 'react';
import { motion } from 'motion/react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, onClick, className = '', type = 'button' }) => {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-8 py-3 bg-accent text-white font-subheading font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default PrimaryButton;
