"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
export type PaletteId = 'serene' | 'clay' | 'moss' | 'desert' | 'ocean' | 'spring' | 'sunset' | 'vintage' | 'custom';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  paletteId: PaletteId;
  setPaletteId: (id: PaletteId) => void;
  isGrayscale: boolean;
  setGrayscale: (value: boolean) => void;
  bgType: 'color' | 'image';
  setBgType: (type: 'color' | 'image') => void;
  bgValue: string;
  setBgValue: (value: string) => void;
  glassBlur: number;
  setGlassBlur: (value: number) => void;
  customPrimary: string;
  setCustomPrimary: (value: string) => void;
  customSecondary: string;
  setCustomSecondary: (value: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const toHex = (value: number) => clampChannel(value).toString(16).padStart(2, '0');

const colorPairFromHex = (hex: string) => {
  const sanitized = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) {
    return { primary: '#9e7a58', secondary: '#9cab8f' };
  }

  const red = parseInt(sanitized.slice(0, 2), 16);
  const green = parseInt(sanitized.slice(2, 4), 16);
  const blue = parseInt(sanitized.slice(4, 6), 16);

  const primary = `#${toHex(red - 36)}${toHex(green - 26)}${toHex(blue - 20)}`;
  const secondary = `#${toHex(red + 24)}${toHex(green + 18)}${toHex(blue + 12)}`;

  return { primary, secondary };
};

const imagePairFromValue = (value: string) => {
  const presets = [
    { match: '1501854140801-50d01698950b', primary: '#c1e1c1', secondary: '#ffccac' }, // Mint & Peach
    { match: '1557683311-eac922347aa1', primary: '#dcd0ff', secondary: '#f4cfdf' }, // Lavender & Rose
    { match: '1486406146926-c627a92ad1ab', primary: '#b9d8ff', secondary: '#ffe5b4' }, // Sky & Apricot
    { match: '1509316785289-025f5b846b35', primary: '#ffccac', secondary: '#c1e1c1' }  // Peach & Mint
  ] as const;

  return presets.find(item => value.includes(item.match)) ?? { primary: '#9e7a58', secondary: '#9cab8f' };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('light'); // Force Light
  const [paletteId, setPaletteIdState] = useState<PaletteId>('serene');
  const [isGrayscale, setGrayscaleState] = useState<boolean>(false);
  const [bgType] = useState<'color' | 'image'>('image'); // Force Image
  const [bgValue] = useState<string>('/assets/image/windows-xp.jpg'); // Force XP Bliss
  const [glassBlur, setGlassBlurState] = useState<number>(4); // Reduced blur for XP clarity
  const [customPrimary, setCustomPrimaryState] = useState<string>('#9e7a58');
  const [customSecondary, setCustomSecondaryState] = useState<string>('#9cab8f');

  // Force Light Theme on HTML
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-palette', paletteId);
  }, [paletteId]);

  // Use useMemo to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    theme: 'light' as Theme,
    toggleTheme: () => {}, // Disabled
    paletteId,
    setPaletteId: (id: PaletteId) => setPaletteIdState(id),
    isGrayscale,
    setGrayscale: (value: boolean) => setGrayscaleState(value),
    bgType: 'image' as const,
    setBgType: () => {}, // Disabled
    bgValue: '/assets/image/windows-xp.jpg',
    setBgValue: () => {}, // Disabled
    glassBlur,
    setGlassBlur: (value: number) => setGlassBlurState(value),
    customPrimary,
    setCustomPrimary: (value: string) => setCustomPrimaryState(value),
    customSecondary,
    setCustomSecondary: (value: string) => setCustomSecondaryState(value),
  }), [paletteId, isGrayscale, glassBlur, customPrimary, customSecondary]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
