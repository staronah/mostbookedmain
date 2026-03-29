
import React from 'react';
import { motion } from 'motion/react';

const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-primary flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-12">
          <h1 className="text-ui font-hero text-6xl md:text-8xl tracking-tighter relative z-10">
            MOSTBOOKED<span className="text-accent">.</span>
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute -bottom-2 left-0 h-1 bg-accent"
          />
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-64 h-[1px] bg-ui/5 relative overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent"
            />
          </div>
          <p className="text-ui/30 font-subheading text-[10px] uppercase tracking-[0.6em] animate-pulse">
            Initializing Cinematic Experience
          </p>
        </div>
      </motion.div>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
