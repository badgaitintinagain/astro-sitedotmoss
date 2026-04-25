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
    <div className="w-full h-full min-h-[540px] bg-[#fdfaf7]/80 text-stone-800 overflow-hidden flex flex-col font-sans border border-stone-100 backdrop-blur-md rounded-xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-white/40">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-primary/10 rounded-lg">
                    <Images className="text-accent-primary" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900">Image Converter</h2>
                    <p className="text-[11px] text-stone-500 font-medium">Quickly format your photos</p>
                </div>
            </div>
            {photos.length > 0 && (
                <button 
                    onClick={() => setPhotos([])} 
                    className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-red-500 hover:bg-red-50/50 transition-all rounded-full border border-stone-200"
                >
                    Clear Queue
                </button>
            )}
        </div>

        <div className="flex-1 p-5 flex flex-col lg:flex-row gap-6 overflow-hidden">
            <aside className="w-full lg:w-72 flex flex-col gap-6">
                <div className="bg-white/50 rounded-2xl p-5 border border-white/60 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-xs font-bold mb-3 text-stone-400 uppercase tracking-widest">Format</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {FORMAT_OPTIONS.map(opt => (
                                <button 
                                    key={opt.value} 
                                    onClick={() => setTargetFormat(opt.value)} 
                                    className={`py-2 text-[10px] font-bold transition-all rounded-xl border ${targetFormat === opt.value ? 'bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/20' : 'bg-white text-stone-500 border-stone-100 hover:border-stone-200 hover:bg-stone-50/50'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Quality</h3>
                            <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">{Math.round(quality*100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={quality * 100} 
                            onChange={e => setQuality(Number(e.target.value)/100)} 
                            className="w-full accent-accent-primary h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer" 
                        />
                        <div className="flex justify-between text-[9px] mt-2 font-bold text-stone-400">
                            <span>FASTER</span>
                            <span>BETTER</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={convertAll} 
                    disabled={photos.length === 0 || isConverting} 
                    className="mt-auto bg-stone-900 text-white p-4 rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all disabled:opacity-20 disabled:grayscale shadow-lg shadow-stone-200 active:scale-[0.98]"
                >
                    {isConverting ? 'Processing...' : 'Convert Images'}
                </button>
            </aside>

            <main className="flex-1 bg-white/40 rounded-2xl border border-white/60 p-5 overflow-y-auto no-scrollbar shadow-inner">
                {photos.length === 0 ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="h-full min-h-[320px] border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-5 cursor-pointer hover:border-accent-primary/30 hover:bg-accent-primary/[0.02] transition-all group"
                    >
                        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFiles} />
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-accent-primary/10 transition-all">
                            <Upload size={28} className="text-stone-400 group-hover:text-accent-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-stone-600">Drop your photos here</p>
                            <p className="text-xs text-stone-400 font-medium mt-1">or click to browse files</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {photos.map(p => (
                            <div key={p.id} className="bg-white rounded-2xl p-2 border border-stone-100 shadow-sm group relative overflow-hidden transition-all hover:shadow-md hover:border-stone-200">
                                <div className="aspect-square rounded-xl overflow-hidden mb-2">
                                    <img src={p.preview} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                </div>
                                <div className="px-1 flex justify-between items-center">
                                    <div className="text-[10px] font-bold truncate text-stone-500 max-w-[80%]">{p.file.name}</div>
                                    <button 
                                        onClick={() => setPhotos(photos.filter(x => x.id !== p.id))} 
                                        className="text-stone-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
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
