"use client";
import React, { useEffect } from 'react';
import Tile from './Tile';

interface AdTileProps {
  title?: string;
  description?: string;
  image?: string;
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
  adSlot?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AdTile: React.FC<AdTileProps> = ({ 
  title = "Sponsored",
  description = "Advertisement",
  image = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=420&q=60",
  size = "3x2",
  accent = "secondary",
  opacity = 35,
  adSlot = ""
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!adSlot) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore duplicate ad init errors during dev HMR.
    }
  }, [adSlot]);

  return (
    <Tile 
      size={size} 
      label="Sponsored"
      accentType={accent}
      opacity={opacity}
      bgImage={image}
    >
      <div className="mx-1 mb-0.5 flex h-full w-full flex-col justify-end border border-white/10 bg-black/50 px-3 py-2 text-center shadow-xl backdrop-blur-md transition-all duration-500 group-hover:scale-105">
        {adSlot ? (
          <ins
            className="adsbygoogle block min-h-[120px] w-full"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-2243740976665372"
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <>
            <h3 className="mb-0.5 text-xs font-bold leading-tight text-white/90">{title}</h3>
            <p className="max-w-[140px] text-[7px] leading-tight text-zinc-100 opacity-100">{description}</p>
            <p className="mt-1 text-[6px] font-bold uppercase tracking-wide text-white/80">Set adSlot to enable AdSense</p>
          </>
        )}
      </div>
    </Tile>
  );
};

export default AdTile;
