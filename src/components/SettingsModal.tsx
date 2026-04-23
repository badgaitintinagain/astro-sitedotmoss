"use client";
import React, { useState, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Sun, Moon, Check, Ghost, Image as ImageIcon, Wind, Zap, Palette } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SourcePreset = {
  id: string;
  type: 'color' | 'image';
  value: string;
  name: string;
  hint: string;
};

type ToneSwatch = {
  id: string;
  name: string;
  value: string;
};

const SettingsModal: React.FC<SettingsModalProps> = memo(({ isOpen, onClose }: SettingsModalProps) => {
  const { 
    theme, toggleTheme, isGrayscale, setGrayscale,
    bgType, bgValue, setBgValue, glassBlur, setGlassBlur, setBgType
  } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [activeSection, setActiveSection] = useState<'interface' | 'canvas' | 'tones' | 'accessibility'>('interface');

  const sourcePresets = useMemo<SourcePreset[]>(() => [
    { id: 'beige', type: 'color', value: '#F2EBE3', name: 'Warm Paper', hint: 'soft neutral' },
    { id: 'charcoal', type: 'color', value: '#1A1A1A', name: 'Deep Bark', hint: 'night ground' },
    { id: 'nature', type: 'image', value: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1600&q=80', name: 'Nature', hint: 'green wash' },
    { id: 'abstract', type: 'image', value: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1600&q=80', name: 'Abstract', hint: 'soft motion' },
    { id: 'city', type: 'image', value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80', name: 'City', hint: 'cool dusk' },
    { id: 'aurora', type: 'image', value: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1600&q=80', name: 'Aurora', hint: 'glow' },
    { id: 'ocean-drive', type: 'image', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80', name: 'Ocean Drive', hint: 'sea mist' },
    { id: 'mountain-fog', type: 'image', value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80', name: 'Mountain Fog', hint: 'stone + sky' },
    { id: 'neon-night', type: 'image', value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80', name: 'Neon Night', hint: 'muted lights' },
    { id: 'desert-dunes', type: 'image', value: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1600&q=80', name: 'Desert Dunes', hint: 'sun baked' },
  ], []);

  const toneSwatches = useMemo<ToneSwatch[]>(() => [
    { id: 'oat', name: 'Oat', value: '#F1E6D6' },
    { id: 'sand', name: 'Sand', value: '#E6D2B5' },
    { id: 'clay', name: 'Clay', value: '#C98B6E' },
    { id: 'sage', name: 'Sage', value: '#B7C3A1' },
    { id: 'moss', name: 'Moss', value: '#879B74' },
    { id: 'dune', name: 'Dune', value: '#D8C1A0' },
    { id: 'blush', name: 'Blush', value: '#E8C0BB' },
    { id: 'apricot', name: 'Apricot', value: '#EFC6A0' },
    { id: 'pine', name: 'Pine', value: '#6E8570' },
    { id: 'cocoa', name: 'Cocoa', value: '#8E6D57' },
    { id: 'smoke', name: 'Smoke', value: '#C8C3BA' },
    { id: 'olive', name: 'Olive', value: '#9A9674' },
  ], []);

  const visibleBgPresets = useMemo(
    () => sourcePresets.filter(bg => bg.type === bgType),
    [sourcePresets, bgType]
  );

  const settingsSections = useMemo(() => ([
    { id: 'interface' as const, label: 'Interface', icon: Sun },
    { id: 'canvas' as const, label: 'Canvas', icon: ImageIcon },
    { id: 'tones' as const, label: 'Tones', icon: Palette },
    { id: 'accessibility' as const, label: 'Accessibility', icon: Ghost }
  ]), []);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-colors duration-500 ${isDragging ? 'bg-stone-100' : 'bg-[radial-gradient(circle_at_18%_16%,rgba(214,199,177,0.34)_0%,rgba(214,199,177,0.06)_28%,transparent_50%),radial-gradient(circle_at_84%_14%,rgba(156,171,135,0.30)_0%,rgba(156,171,135,0.06)_26%,transparent_44%),linear-gradient(180deg,rgba(26,20,16,0.06)_0%,rgba(242,235,227,0.16)_100%)]'}`}>
      <div
        className={`absolute inset-0 backdrop-blur-2xl transition-all duration-500 ${isDragging ? 'opacity-0' : 'opacity-100'}`}
        onClick={onClose}
      />

      <motion.div
        className="relative flex h-[82vh] w-full max-w-4xl flex-col overflow-hidden border border-white/28 text-foreground shadow-[0_30px_90px_rgba(39,30,24,0.28)] backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: isDragging ? 0.15 : 1, scale: isDragging ? 0.98 : 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.28 }}
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <div className="flex items-center justify-between border-b border-white/20 bg-[linear-gradient(135deg,rgba(255,248,241,0.60)_0%,rgba(247,235,225,0.38)_42%,rgba(228,235,221,0.34)_100%)] p-5 backdrop-blur-xl backdrop-saturate-150 dark:bg-[linear-gradient(135deg,rgba(60,47,39,0.65)_0%,rgba(45,37,31,0.54)_45%,rgba(74,81,64,0.48)_100%)] md:p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-white/35 bg-white/35 shadow-inner backdrop-blur-md dark:bg-white/10">
              <Zap className="text-accent-primary" size={18} />
            </div>
            <div>
              <h2 className="text-[1.1rem] font-medium tracking-tight text-foreground md:text-xl">Settings</h2>
              <p className="text-xs tracking-wide text-foreground/45 md:text-xs">soft controls for the dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border border-white/25 bg-white/20 p-2.5 text-foreground/80 transition-all duration-200 hover:bg-white/35 hover:text-foreground backdrop-blur-md backdrop-saturate-150"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="border-b border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.06)_100%)] p-2.5 backdrop-blur-xl backdrop-saturate-150 md:w-[220px] md:border-b-0 md:border-r md:p-3.5 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)]">
            <div className="mb-2 border border-white/20 bg-white/18 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:bg-white/8">
              <p className="text-xs tracking-wide text-foreground/45">Navigation</p>
              <p className="mt-1 text-sm text-foreground/70">Choose a control family</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1">
              {settingsSections.map(section => {
                const Icon = section.icon;
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2.5 border px-3 py-2.5 text-left text-xs transition-all ${active ? 'border-white/30 bg-white/30 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.10)]' : 'border-white/15 bg-white/12 text-foreground/70 hover:border-white/25 hover:bg-white/20'}`}
                  >
                    <Icon size={14} className={active ? 'text-accent-primary' : ''} />
                    <span className="truncate font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 no-scrollbar md:p-5">
            {activeSection === 'interface' && (
              <section className="space-y-4">
                <div className="border border-white/20 bg-[linear-gradient(135deg,rgba(255,250,245,0.76)_0%,rgba(246,235,220,0.58)_100%)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:bg-[linear-gradient(135deg,rgba(63,50,42,0.70)_0%,rgba(50,41,34,0.56)_100%)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Sun size={16} className="text-foreground/45" />
                    <h3 className="text-xs font-bold text-stone-500">Interface</h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="border border-white/20 bg-white/22 p-3.5 backdrop-blur-md dark:bg-white/8">
                      <p className="text-sm font-medium text-foreground">Day / Night</p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/60">Keep the UI in warm daylight or switch to a softer dusk mode.</p>
                    </div>
                    <div className="border border-white/20 bg-white/18 p-3.5 backdrop-blur-md dark:bg-white/8">
                      <p className="text-xs tracking-wide text-foreground/45">Current mood</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{theme === 'dark' ? 'Earth dusk' : 'Warm parchment'}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`flex items-center justify-center gap-2 border px-4 py-3 transition-all ${theme === 'light' ? 'border-white/30 bg-white/45 text-foreground font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.08)]' : 'border-white/15 bg-white/12 text-foreground/50'}`}
                    >
                      <Sun size={16} className={theme === 'light' ? 'text-amber-500' : ''} />
                      <span className="text-sm">Day</span>
                    </button>
                    <button
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`flex items-center justify-center gap-2 border px-4 py-3 transition-all ${theme === 'dark' ? 'border-white/30 bg-white/45 text-foreground font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.08)]' : 'border-white/15 bg-white/12 text-foreground/50'}`}
                    >
                      <Moon size={16} className={theme === 'dark' ? 'text-slate-600' : ''} />
                      <span className="text-sm">Night</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'canvas' && (
              <section className="space-y-4">
                <div className="border border-white/20 bg-[linear-gradient(135deg,rgba(255,250,245,0.66)_0%,rgba(250,244,238,0.40)_100%)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:bg-[linear-gradient(135deg,rgba(58,46,39,0.66)_0%,rgba(48,40,33,0.52)_100%)]">
                  <div className="mb-3 flex items-center gap-2">
                    <ImageIcon size={16} className="text-foreground/45" />
                    <h3 className="text-xs font-bold text-stone-500">Canvas</h3>
                  </div>
                  <div className="flex border border-white/20 bg-white/18 p-1.5 backdrop-blur-md dark:bg-white/8">
                    <button
                      onClick={() => setBgType('color')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs  tracking-[0.22em] transition-all ${bgType === 'color' ? 'bg-white/48 border border-white/30 text-foreground font-semibold shadow-[0_6px_16px_rgba(0,0,0,0.08)]' : 'text-foreground/45'}`}
                    >
                      Color
                    </button>
                    <button
                      onClick={() => setBgType('image')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs  tracking-[0.22em] transition-all ${bgType === 'image' ? 'bg-white/48 border border-white/30 text-foreground font-semibold shadow-[0_6px_16px_rgba(0,0,0,0.08)]' : 'text-foreground/45'}`}
                    >
                      Image
                    </button>
                  </div>
                  <div className="mt-3 border border-white/18 bg-white/16 p-3 text-xs text-foreground/60 dark:bg-white/8">
                    Choose a soft wash for the dashboard canvas, then fine-tune the tone library below.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                  {visibleBgPresets.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setBgType(bg.type);
                        setBgValue(bg.value);
                      }}
                      className={`group relative aspect-square overflow-hidden border transition-all ${bgValue === bg.value && bgType === bg.type ? 'border-white/40 scale-[0.98] shadow-[0_12px_30px_rgba(0,0,0,0.12)]' : 'border-white/15 opacity-85 hover:opacity-100'}`}
                    >
                      {bg.type === 'color' ? (
                        <div className="h-full w-full" style={{ backgroundColor: bg.value }} />
                      ) : (
                        <Image src={bg.value} className="object-cover" alt={bg.name} fill sizes="100px" />
                      )}
                      {bgValue === bg.value && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/18 backdrop-blur-[1px]">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-2 py-1.5 text-left text-xs tracking-wide text-white/90">
                        <div>{bg.name}</div>
                        <div className="opacity-70">{bg.hint}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'tones' && (
              <section className="space-y-4">
                <div className="border border-white/20 bg-[linear-gradient(135deg,rgba(255,247,239,0.72)_0%,rgba(244,235,225,0.52)_100%)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:bg-[linear-gradient(135deg,rgba(57,46,39,0.70)_0%,rgba(45,38,32,0.52)_100%)]">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-foreground/45" />
                      <h3 className="text-xs font-bold text-stone-500">Tone Library</h3>
                    </div>
                    <span className="text-xs tracking-wide text-foreground/45">{bgType === 'color' ? 'active' : 'switch to color'}</span>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-foreground/60">Earthy neutrals and muted pastels for a calmer dashboard mood.</p>
                  {bgType === 'color' ? (
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {toneSwatches.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => {
                            setBgType('color');
                            setBgValue(tone.value);
                          }}
                          className={`group relative overflow-hidden border p-3 text-left transition-all ${bgValue === tone.value ? 'border-white/40 scale-[0.98] shadow-[0_12px_30px_rgba(0,0,0,0.10)]' : 'border-white/15 hover:border-white/25'}`}
                        >
                          <div className="mb-8 h-12 border border-white/20 shadow-inner" style={{ backgroundColor: tone.value }} />
                          <div className="flex items-end justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-semibold text-foreground">{tone.name}</p>
                              <p className="text-xs tracking-wide text-foreground/45">pastel earth</p>
                            </div>
                            {bgValue === tone.value && <Check size={14} className="text-accent-primary" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-white/20 bg-white/18 p-4 text-sm text-foreground/60 dark:bg-white/8">
                      Switch the canvas to <span className="font-semibold text-foreground">Color</span> to use the tone library.
                    </div>
                  )}
                </div>

                <div className="border border-white/20 bg-white/16 p-4 backdrop-blur-md dark:bg-white/8">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind size={16} className="text-foreground/45" />
                      <h3 className="text-xs font-bold text-stone-500">Glass Intensity</h3>
                    </div>
                    <span className="text-xs font-mono text-stone-500">{glassBlur}px</span>
                  </div>
                  <div className="relative pt-2 pb-6">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={glassBlur}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchEnd={() => setIsDragging(false)}
                      onChange={(e) => setGlassBlur(Number(e.target.value))}
                      className="w-full h-1.5 bg-foreground/10 appearance-none cursor-pointer accent-accent-primary"
                    />
                    {isDragging && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-stone-500 animate-bounce">
                        Previewing Dashboard...
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'accessibility' && (
              <section className="space-y-4">
                <div className="border border-white/20 bg-[linear-gradient(135deg,rgba(255,247,241,0.70)_0%,rgba(244,240,233,0.46)_100%)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:bg-[linear-gradient(135deg,rgba(60,48,41,0.70)_0%,rgba(45,38,32,0.52)_100%)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Ghost size={16} className="text-foreground/45" />
                    <h3 className="text-xs font-bold text-stone-500">Accessibility</h3>
                  </div>
                  <button
                    onClick={() => setGrayscale(!isGrayscale)}
                    className={`w-full flex items-center justify-between border p-4 transition-all ${isGrayscale ? 'border-white/35 bg-white/35 text-foreground font-semibold shadow-[0_10px_28px_rgba(0,0,0,0.10)]' : 'border-white/15 bg-white/14 text-foreground/85'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Ghost size={16} />
                      <span className="text-sm">Force to Grayscale</span>
                    </div>
                    <div className={`relative h-6 w-11 transition-colors ${isGrayscale ? 'bg-accent-primary' : 'bg-gray-400/30'}`}>
                      <div className={`absolute top-1 h-4 w-4 bg-white transition-all ${isGrayscale ? 'left-6' : 'left-1'}`} />
                    </div>
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="mt-auto flex-shrink-0 border-t border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.03)_100%)] p-5 text-center text-stone-600 backdrop-blur-md">
          <p className="text-[8px] tracking-[0.3em] text-foreground">site(.)moss, Built by Moss. Refined by Claude. (NextJS, React, Turso SQLite and Huggingface)</p>
        </div>
      </motion.div>

      {isDragging && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200px] border border-white/20 bg-white/10 px-6 py-3 pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3 text-white">
            <Wind size={20} className="animate-spin" />
            <span className="text-lg font-light">Adjusting Blur</span>
          </div>
        </div>
      )}
    </div>
  );
});

SettingsModal.displayName = 'SettingsModal';

export default SettingsModal;
