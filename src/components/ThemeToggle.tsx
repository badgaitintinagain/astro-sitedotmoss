"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 md:top-8 right-6 z-50 p-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all duration-200 group backdrop-blur-xl shadow-lg hover:shadow-xl"
      aria-label="Toggle theme"
      >
      <motion.div
        key={theme}
        className="flex items-center justify-center w-8 h-8"
        initial={{ rotate: theme === 'dark' ? -180 : 0, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.45 }}
      >
        {theme === 'light' ? (
          <Sun size={18} className="text-amber-600 transition-colors" />
        ) : (
          <Moon size={18} className="text-indigo-400 transition-colors" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
