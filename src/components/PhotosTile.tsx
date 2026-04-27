"use client";
import React, { useMemo, useRef, useState } from 'react';
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
    const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
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

  const activePhoto = useMemo(() => {
    if (!photos.length) return null;
    return photos.find(photo => photo.id === activePhotoId) ?? photos[0];
  }, [activePhotoId, photos]);

  if (!isFullPage) {
    return (
        <Tile size={size} label="Photos" icon={Images} accentType={accent} opacity={opacity} onClick={() => window.location.href = '/photos'} />
    );
  }

  return (
    <div className="relative min-h-[540px] overflow-hidden bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.24)_24%,transparent_44%),radial-gradient(circle_at_82%_14%,rgba(210,230,224,0.45)_0%,transparent_30%),radial-gradient(circle_at_50%_88%,rgba(159,182,146,0.22)_0%,transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.70)_0%,rgba(245,246,242,0.48)_42%,rgba(229,236,220,0.38)_100%)] text-stone-800 shadow-[0_24px_60px_rgba(93,78,61,0.10)]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.36)_0%,transparent_22%,rgba(255,255,255,0.18)_42%,transparent_64%,rgba(255,255,255,0.12)_100%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:3rem_3rem] opacity-35 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 flex flex-col gap-5 p-5 md:p-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[rgba(255,255,255,0.52)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_24px_rgba(109,92,71,0.08)] backdrop-blur-md">
                        <Images className="text-[#7f9778]" size={22} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-[2rem] font-semibold tracking-[-0.03em] text-stone-900">Photos</h2>
                        <p className="text-[12px] md:text-[13px] text-stone-600 max-w-xl">A liquid-glass workspace for moving, sorting, and converting image sets without losing clarity.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                    <span className="rounded-none bg-[rgba(255,255,255,0.42)] px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">{photos.length} files</span>
                    <span className="rounded-none bg-[rgba(255,255,255,0.42)] px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">{targetFormat.replace('image/', '').toUpperCase()}</span>
                    <span className="rounded-none bg-[rgba(255,255,255,0.42)] px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">{Math.round(quality * 100)}% quality</span>
                </div>
            </header>

            <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <aside className="rounded-none bg-[rgba(255,255,255,0.40)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_40px_rgba(98,81,63,0.08)] backdrop-blur-2xl">
                    <div className="space-y-5">
                        <div>
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Format</p>
                            <div className="grid grid-cols-3 gap-2">
                                {FORMAT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setTargetFormat(opt.value)}
                                        className={`rounded-none px-3 py-2 text-[10px] font-semibold tracking-[0.16em] transition-all ${targetFormat === opt.value ? 'bg-[rgba(115,144,109,0.92)] text-white shadow-[0_8px_18px_rgba(111,136,104,0.26)]' : 'bg-[rgba(255,255,255,0.58)] text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:bg-white/80'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Quality</p>
                                <span className="rounded-none bg-[rgba(115,144,109,0.12)] px-2.5 py-0.5 text-[10px] font-bold text-[#6f8e67]">{Math.round(quality * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={quality * 100}
                                onChange={e => setQuality(Number(e.target.value) / 100)}
                                className="w-full accent-[#6f8e67] h-1.5 bg-[rgba(255,255,255,0.55)] rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="mt-2 flex justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                <span>Faster</span>
                                <span>Better</span>
                            </div>
                        </div>

                        <button
                            onClick={convertAll}
                            disabled={photos.length === 0 || isConverting}
                            className="w-full rounded-none bg-[linear-gradient(180deg,rgba(120,147,113,0.96)_0%,rgba(100,129,94,0.96)_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(100,129,94,0.24)] transition-all disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            {isConverting ? 'Processing...' : 'Convert Images'}
                        </button>

                        {photos.length > 0 && (
                            <button
                                onClick={() => setPhotos([])}
                                className="w-full rounded-none bg-[rgba(255,255,255,0.42)] px-4 py-3 text-xs font-semibold text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all hover:bg-white/70 hover:text-stone-800"
                            >
                                Clear Queue
                            </button>
                        )}
                    </div>
                </aside>

                <main className="rounded-none bg-[rgba(255,255,255,0.36)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_20px_50px_rgba(95,79,60,0.08)] backdrop-blur-2xl overflow-hidden">
                    {photos.length === 0 ? (
                        <div
                            onDragEnter={() => setIsDragOver(true)}
                            onDragLeave={() => setIsDragOver(false)}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragOver(true);
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                setIsDragOver(false);
                                onFiles({ target: { files: event.dataTransfer.files } } as any);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex min-h-[430px] cursor-pointer flex-col items-center justify-center rounded-none border border-dashed transition-all ${isDragOver ? 'border-[#7f9778] bg-[rgba(127,151,120,0.10)]' : 'border-[rgba(120,120,120,0.12)] bg-[rgba(255,255,255,0.22)]'} shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]`}
                        >
                            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFiles} />
                            <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-none bg-[rgba(255,255,255,0.66)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_22px_rgba(102,89,69,0.08)]">
                                <Upload size={30} className="text-stone-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold tracking-[-0.02em] text-stone-800">Drop your photos here</p>
                                <p className="mt-1 text-sm text-stone-500">or click to browse files</p>
                            </div>
                            <div className="mt-8 grid grid-cols-3 gap-3 opacity-75">
                                {['Preview', 'Convert', 'Export'].map((label) => (
                                    <div key={label} className="rounded-none bg-[rgba(255,255,255,0.52)] px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_20rem]">
                            <div className="rounded-none bg-[rgba(255,255,255,0.44)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                                <div className="relative overflow-hidden rounded-none bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(245,245,242,0.44)_100%)] aspect-[4/3]">
                                    <img src={activePhoto?.preview} alt={activePhoto?.file?.name || 'Selected preview'} className="h-full w-full object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent_0%,rgba(17,22,17,0.68)_100%)] px-4 py-4 text-white">
                                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/70">Selected file</div>
                                        <div className="mt-1 text-sm font-semibold truncate">{activePhoto?.file?.name}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-none bg-[rgba(255,255,255,0.40)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">Library</p>
                                        <p className="mt-1 text-sm text-stone-600">Tap a tile to focus it.</p>
                                    </div>
                                    <div className="rounded-full bg-[rgba(127,151,120,0.12)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f8e67]">
                                        {photos.length}
                                    </div>
                                </div>

                                <div className="mb-4 border border-white/40 bg-[rgba(255,255,255,0.34)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
                                    <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-stone-500">
                                        <span>Preview strip</span>
                                        <span>Recent</span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        {photos.slice(0, 8).map((photo) => (
                                            <button
                                                key={photo.id}
                                                onClick={() => setActivePhotoId(photo.id)}
                                                className={`h-16 w-20 shrink-0 overflow-hidden rounded-none border transition-all ${activePhoto?.id === photo.id ? 'border-[#7f9778] ring-1 ring-[#7f9778]/30' : 'border-white/50 hover:border-stone-300'}`}
                                            >
                                                <img src={photo.preview} className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid max-h-[340px] gap-3 overflow-y-auto pr-1 no-scrollbar">
                                    {photos.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => setActivePhotoId(p.id)}
                                            className={`group flex cursor-pointer items-center gap-3 rounded-none p-2 text-left transition-all ${activePhoto?.id === p.id ? 'bg-[rgba(126,151,120,0.16)] shadow-[0_10px_24px_rgba(95,79,60,0.08)]' : 'bg-[rgba(255,255,255,0.46)] hover:bg-white/65'}`}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-none bg-white/60">
                                                <img src={p.preview} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[12px] font-semibold text-stone-800">{p.file.name}</div>
                                                <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-stone-500">{p.file.type || 'image'}</div>
                                            </div>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setPhotos(photos.filter(x => x.id !== p.id));
                                                }}
                                                className="rounded-none p-2 text-stone-400 transition-colors hover:bg-white/70 hover:text-red-500"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    </div>
  );
};

export default PhotosTile;
