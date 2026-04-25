"use client";
import React, { useState, useRef } from 'react';
import Tile from './Tile';
import { Images, Upload, Trash2 } from 'lucide-react';

interface PhotosTileProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
  isFullPage?: boolean;
}

type SupportedFormat = 'image/png' | 'image/jpeg' | 'image/webp';
const FORMAT_OPTIONS: Array<{ value: SupportedFormat; label: string; ext: string }> = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/webp', label: 'WEBP', ext: 'webp' },
];

const PhotosTile: React.FC<PhotosTileProps> = ({ size = '2x1', accent = 'primary', opacity = 35, isFullPage = false }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('image/webp');
  const [quality, setQuality] = useState(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFiles = (e: any) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((f: any) => ({
      id: Math.random().toString(36),
      file: f,
      preview: URL.createObjectURL(f)
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const convertAll = async () => {
    setIsConverting(true);
    // Simulation of conversion
    await new Promise(r => setTimeout(r, 1000));
    setIsConverting(false);
    alert('CONVERSION_COMPLETE');
  };

  if (!isFullPage) {
    return (
        <Tile size={size} label="Photos" icon={Images} accentType={accent} opacity={opacity} onClick={() => window.location.href = '/photos'} />
    );
  }

  return (
    <div className="w-full h-full min-h-[540px] bg-[#f8efe4]/78 text-stone-800 overflow-hidden flex flex-col font-mono border border-stone-200 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white/72">
            <div className="flex items-center gap-3">
                <Images className="text-accent-primary" />
                <h2 className="text-lg font-semibold tracking-tight text-stone-900">Image Converter</h2>
            </div>
            {photos.length > 0 && (
                <button onClick={() => setPhotos([])} className="border border-stone-200 px-3 py-1 text-xs font-semibold hover:bg-stone-100 transition-all">
                    Clear Queue
                </button>
            )}
        </div>

        <div className="flex-1 p-3 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
            <aside className="w-full lg:w-64 flex flex-col gap-4 md:gap-6">
                <div className="border border-stone-200 p-4 bg-white/70">
                    <h3 className="text-xs font-semibold mb-4 text-stone-500">Export_Format</h3>
                    <div className="flex flex-col gap-2">
                        {FORMAT_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => setTargetFormat(opt.value)} className={`border p-2 text-xs font-semibold transition-all ${targetFormat === opt.value ? 'bg-[#f5e8d8] text-stone-900 border-[#cfb59a]' : 'border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-white'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border border-stone-200 p-4 bg-white/70">
                    <h3 className="text-xs font-semibold mb-4 text-stone-500">Quality_Control</h3>
                    <input type="range" min="10" max="100" value={quality * 100} onChange={e => setQuality(Number(e.target.value)/100)} className="w-full accent-accent-primary" />
                    <div className="flex justify-between text-xs mt-2 font-bold text-stone-600"><span>LOW</span><span>{Math.round(quality*100)}%</span><span>HIGH</span></div>
                </div>

                <button onClick={convertAll} disabled={photos.length === 0 || isConverting} className="mt-auto border-2 border-stone-200 bg-white/75 p-4 font-semibold text-xs hover:bg-white transition-all disabled:opacity-30">
                    {isConverting ? 'CONVERTING...' : 'RUN_CONVERSION_TASK'}
                </button>
            </aside>

            <main className="flex-1 border border-stone-200 bg-white/65 p-4 md:p-6 overflow-y-auto no-scrollbar">
                {photos.length === 0 ? (
                    <div onClick={() => fileInputRef.current?.click()} className="h-full min-h-[280px] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-stone-300 transition-all bg-white/55">
                        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFiles} />
                        <Upload size={32} className="opacity-40 text-stone-500" />
                        <span className="text-xs font-semibold text-stone-500">DROP_OR_CLICK_TO_ADD_IMAGES</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {photos.map(p => (
                            <div key={p.id} className="border border-stone-200 p-1 bg-white/75 group relative">
                                <img src={p.preview} className="w-full aspect-square object-cover" />
                                <div className="text-[8px] mt-1 font-bold truncate p-1 text-stone-700">{p.file.name.toUpperCase()}</div>
                                <button onClick={() => setPhotos(photos.filter(x => x.id !== p.id))} className="absolute top-2 right-2 bg-white text-stone-700 border border-stone-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default PhotosTile;
