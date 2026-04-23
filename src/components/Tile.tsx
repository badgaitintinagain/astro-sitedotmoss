import React, { useMemo, useRef, memo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LucideIcon } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TileProps {
  size: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  shape?: 'rect' | 'circle' | 'triangle';
  label?: string;
  className?: string;
  children?: React.ReactNode;
  bgClass?: string;
  bgImage?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  accentType?: 'primary' | 'secondary';
  opacity?: number;
}

const Tile: React.FC<TileProps> = memo(({ size, shape = 'rect', label, className = '', children, bgClass = '', bgImage, icon: Icon, onClick, accentType, opacity }) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const entryDelay = useMemo(() => Math.random() * 0.3, []);
  
  const tileStyle = useMemo(() => {
    if (bgImage) return { color: 'tile--image', hasTexture: false, textureType: '' };
    
    const colors = [
        'bg-void-muted/80', 
        'bg-void-muted/80', 
        'bg-void-muted/80',
        'bg-pastel-mint/10', 
        'bg-pastel-peach/10', 
        'bg-pastel-lavender/10', 
        'bg-pastel-rose/10'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const hasTexture = Math.random() > 0.6;
    const textureType = Math.random() > 0.5 ? 'tile-texture-grid' : 'tile-texture';
    
    return { color, hasTexture, textureType };
  }, [bgImage]);

  const sizeClasses = {
    '1x1': 'col-span-1 row-span-1',
    '2x1': 'col-span-2 row-span-1',
    '2x2': 'col-span-2 row-span-2',
    '2x3': 'col-span-2 row-span-3',
    '3x2': 'col-span-3 row-span-2',
  };

  const isSmall = size === '1x1' || size === '2x1';

  return (
    <div
      ref={tileRef}
      onClick={onClick}
      className={cn(
        "tile group cursor-pointer pointer-events-auto",
        sizeClasses[size],
        tileStyle.color,
        className
      )}
      style={{
        animationDelay: `${entryDelay}s`,
      }}
    >
        {tileStyle.hasTexture && (
            <div className={tileStyle.textureType}></div>
        )}

        {/* Background Image Container */}
        {bgImage && (
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src={bgImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            </div>
        )}

        {/* Corners from Lite version */}
        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>

        <div className={cn(
            "tile-live relative z-10 pointer-events-none",
            bgImage ? "text-white" : ""
        )}>
            {Icon && <Icon className="w-7 h-7 mb-1" />}
            {children}
        </div>

        {label && (
            <span className="tile-title z-30">{label}</span>
        )}
    </div>
  );
});

Tile.displayName = 'Tile';

export default Tile;
