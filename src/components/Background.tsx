"use client";
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

const FrutigerAeroElements: React.FC = () => {
  // Realistic Soap Bubbles with multi-layered highlights
  const bubbles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * 120 + 40,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 25,
      delay: Math.random() * -30,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-1 overflow-hidden pointer-events-none">
      {/* Dynamic Sunlight Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(255,255,255,0.4)_0%,transparent_50%)] animate-pulse duration-[10s]"></div>
      
      {/* Glassy Rays / Sweeps */}
      <motion.div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
            background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 45%, rgba(255,255,255,0.8) 50%, transparent 65%)',
            backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0%', '-100% 0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* Frutiger Bubbles */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full border border-white/40 shadow-[0_5px_15px_rgba(255,255,255,0.2)]"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)',
            backdropFilter: 'blur(1px)',
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, 40, 0],
            scale: [1, 1.15, 0.9],
            rotate: [0, 360],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        >
            {/* Glossy Primary Highlight */}
            <div className="absolute top-[10%] left-[15%] w-[35%] h-[30%] bg-gradient-to-br from-white/60 to-transparent rounded-full blur-[1px]"></div>
            {/* Secondary Bottom Reflection */}
            <div className="absolute bottom-[10%] right-[20%] w-[20%] h-[15%] bg-white/20 rounded-full blur-[2px]"></div>
        </motion.div>
      ))}
    </div>
  );
};

const Background: React.FC = () => {
  const { glassBlur } = useTheme();
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none">
      {/* Windows XP Bliss Base Image */}
      <div 
        className="absolute inset-0 scale-105"
        style={{
            backgroundImage: 'url(/assets/image/windows-xp.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.05) saturate(1.1)', // Enhance XP vibrance
        }}
      />

      {/* Frutiger Aero Detail Layer */}
      <FrutigerAeroElements />
      
      {/* Liquid Glass Overlay */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={{
          backdropFilter: `blur(${glassBlur}px)`,
          WebkitBackdropFilter: `blur(${glassBlur}px)`,
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Subtle Glossy Texture */}
      <div className="absolute inset-0 z-20 opacity-[0.05] pointer-events-none bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_0%,transparent_100%)]" />
      
      {/* Overall Lightness Adjustment */}
      <div className="absolute inset-0 z-30 bg-white/5 pointer-events-none" />
    </div>
  );
};

export default memo(Background);
