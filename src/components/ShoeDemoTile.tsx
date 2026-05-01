"use client";
import React, { useState, useRef } from 'react';
import Tile from './Tile';
import { Footprints, Upload, Loader2, X, Sparkles, ScanLine, Layers3 } from 'lucide-react';

interface ShoeDemoProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
  isFullPage?: boolean;
}

const ShoeDemoTile: React.FC<ShoeDemoProps> = ({ size = '2x2', accent = 'secondary', opacity = 40, isFullPage = false }) => {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pipelineProgress, setPipelineProgress] = useState(0);
    const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<'upload' | 'results' | 'review'>('upload');

    const MENU_ITEMS = [
        { id: 'upload', label: 'Upload', icon: Upload },
        { id: 'results', label: 'Results', icon: ScanLine },
        { id: 'review', label: 'Review', icon: Layers3 },
    ] as const;

    const shellCard = 'rounded-[14px] border border-stone-300/70 bg-white/72 shadow-[0_1px_0_rgba(255,255,255,0.6)]';
  const resetState = () => {
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setStatusText('');
    setLoading(false);
    setPipelineProgress(0);
    setSelectedPerson(null);
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setStatusText('Processing image');
    setError(null);
    setPipelineProgress(5);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
        const formData = new FormData();
        formData.append('input_image', file);

        const response = await fetch('/api/shoe-demo', {
            method: 'POST',
            body: formData,
        });

        const payload = await response.json();

        if (!response.ok || !payload.ok) {
            throw new Error(payload.error || 'Connection failed');
        }

        setPipelineProgress(100);
        setStatusText('Done');
        setResult(payload.data);
        setLoading(false);
    } catch (err: any) {
                                const message = err?.message || 'Unknown error';
                                setError(
                                    message.includes('Space metadata could not be loaded') || message.includes('Could not resolve app config')
                                        ? 'Cannot load the shoe API right now. The Hugging Face app may be asleep, unavailable, or requires access.'
                                        : message
                                );
        setLoading(false);
    }
  };

  if (!isFullPage) {
    return (
        <Tile
          size={size}
          label="Shoe ML"
          icon={Footprints}
          accentType={accent}
          opacity={opacity}
          onClick={() => window.location.href = '/shoe-demo'}
        />
    );
  }

    const totalPersons = result?.persons?.length ?? 0;
    const summaryLabel = result ? `${totalPersons} detected` : 'No results yet';
    const totalShoes = result?.persons?.reduce((sum: number, p: any) => sum + (p.shoes?.length || 0), 0) ?? 0;

  return (
        <div className="flex h-full min-h-[540px] flex-col overflow-hidden rounded-[22px] border border-stone-300/70 bg-[#f7f2e8]/88 text-stone-900 shadow-[0_26px_100px_rgba(0,0,0,0.15)] backdrop-blur-md">
            <div className="border-b border-stone-300/70 px-4 py-3 sm:px-5 sm:py-3.5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-700">
                            <Sparkles className="h-3 w-3" /> Shoe Class Atlas
                        </div>
                        <p className="mt-1 text-xs text-stone-600">Pairs {result ? totalPersons : 0} • Status {summaryLabel}</p>
                    </div>

                    {(result || previewUrl) && (
                        <button
                            onClick={() => { resetState(); setActiveMenu('upload'); }}
                            className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:bg-white hover:text-stone-900"
                        >
                            <X className="h-3.5 w-3.5" /> Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
                <div className="flex h-full gap-2">
                    <aside className="w-[168px] shrink-0 overflow-y-auto rounded-[14px] border border-stone-300/70 bg-white/72 p-2.5">
                        <p className="px-1 text-[10px] uppercase tracking-[0.2em] text-stone-600">Menu</p>
                        <div className="mt-2 space-y-1.5">
                            {MENU_ITEMS.map(item => {
                                const Icon = item.icon;
                                const active = activeMenu === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveMenu(item.id);
                                            if (item.id === 'upload') fileInputRef.current?.click();
                                        }}
                                        className={`flex w-full items-center gap-2 rounded-[10px] border px-2.5 py-2 text-left text-xs transition-colors ${active ? 'border-stone-300/90 bg-white text-stone-900' : 'border-stone-300/70 bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900'}`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span className="truncate">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="grid h-full gap-4 overflow-y-auto pr-1 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
                            {/* Left column: upload + person grid */}
                            <div className="space-y-2">
                                <div className={shellCard + ' p-3'}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Upload</p>
                                            <h3 className="mt-1 text-base font-semibold text-stone-900">Shoe image</h3>
                                        </div>
                                        <span className="rounded-full border border-stone-300/80 bg-white/90 px-2 py-0.5 text-[10px] text-stone-700">
                                            {loading ? `${pipelineProgress}%` : result ? 'Done' : 'Ready'}
                                        </span>
                                    </div>

                                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

                                    <div
                                        onClick={() => !loading && fileInputRef.current?.click()}
                                        className="mt-3 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-stone-300/80 bg-white/80 p-5 text-center transition-colors hover:bg-white"
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full overflow-hidden rounded-[12px] border border-stone-300/70 bg-stone-100/70">
                                                <img src={previewUrl} className="max-h-[220px] w-full object-contain" />
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={30} className="mb-3 text-stone-500" />
                                                <div className="text-xs uppercase tracking-[0.18em] text-stone-600">Upload image</div>
                                                <div className="mt-1 text-xs text-stone-500">Drop or click to open a shoe photo.</div>
                                            </>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mt-3 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* People grid */}
                                {result?.persons?.length > 0 && (
                                    <div className={shellCard + ' p-3'}>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">People</p>
                                        <div className="mt-2 grid grid-cols-1 gap-2">
                                            {result.persons.map((person: any) => (
                                                <button
                                                    key={person.rank}
                                                    onClick={() => setSelectedPerson(person.rank)}
                                                    className={`flex items-center gap-2 w-full overflow-hidden rounded-[10px] border p-1.5 text-left transition-colors ${selectedPerson === person.rank ? 'border-stone-400 bg-white text-stone-900' : 'border-stone-300/70 bg-white/85 text-stone-700 hover:bg-white'}`}
                                                >
                                                    <img src={person.person_crop_base64} className="h-14 w-14 rounded-md object-cover shrink-0" />
                                                    <div>
                                                        <div className="text-[10px] font-bold">P{person.rank}</div>
                                                        <div className="text-[9px] text-stone-500">{(person.shoes?.length || 0)} shoe{(person.shoes?.length || 0) !== 1 ? 's' : ''}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Center column: preview + thumbnail tray */}
                            <div className="space-y-2 relative">
                                <div className={shellCard + ' p-3 flex flex-col items-center justify-center'}>
                                    <div className="w-full flex-1 flex items-center justify-center">
                                        {previewUrl ? (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <img src={previewUrl} className="max-h-[520px] w-full object-contain rounded" />

                                                {/* Floating thumbnail tray (center-bottom) */}
                                                {result?.persons?.length > 0 && (
                                                    <div className="absolute left-1/2 bottom-4 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-2 py-2 shadow-lg">
                                                        {result.persons.map((p: any, idx: number) => (
                                                            <button
                                                                key={p.rank ?? idx}
                                                                onClick={() => setSelectedPerson(p.rank ?? idx)}
                                                                className={`h-12 w-12 overflow-hidden rounded-[10px] border ${selectedPerson === p.rank ? 'border-amber-500 ring-2 ring-amber-200' : 'border-stone-200'}`}
                                                            >
                                                                <img src={p.person_crop_base64} className="h-full w-full object-cover" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-stone-500">No preview yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right column: annotated + depth + stats */}
                            <div className="space-y-2">
                                <div className={shellCard + ' p-3'}>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Results</p>
                                    {result ? (
                                        <div className="mt-2 space-y-2">
                                            <div className="overflow-hidden rounded-[12px] border border-stone-300/70 bg-stone-100/70 p-1">
                                                <img src={result.annotated_image} className="h-44 w-full object-contain" />
                                            </div>
                                            <div className="overflow-hidden rounded-[12px] border border-stone-300/70 bg-stone-100/70 p-1">
                                                <img src={result.depth_map} className="h-44 w-full object-contain" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 rounded-[12px] border border-stone-300/70 bg-white/80 p-4 text-sm text-stone-600">
                                            Upload an image to review the model output.
                                        </div>
                                    )}
                                </div>

                                <div className={shellCard + ' p-3'}>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Stats</p>
                                    <div className="mt-2 grid gap-2">
                                        <div className="rounded-[10px] border border-stone-300/70 bg-white/85 px-2.5 py-2">
                                            <div className="text-[11px] text-stone-600">Persons</div>
                                            <div className="mt-1 text-base font-semibold text-stone-900">{totalPersons}</div>
                                        </div>
                                        <div className="rounded-[10px] border border-stone-300/70 bg-white/85 px-2.5 py-2">
                                            <div className="text-[11px] text-stone-600">Shoes</div>
                                            <div className="mt-1 text-base font-semibold text-stone-900">{totalShoes}</div>
                                        </div>
                                        <div className="rounded-[10px] border border-stone-300/70 bg-white/85 px-2.5 py-2">
                                            <div className="text-[11px] text-stone-600">Selected</div>
                                            <div className="mt-1 text-base font-semibold text-stone-900">{selectedPerson ?? '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-300/70 px-4 py-2.5 text-[11px] text-stone-500 sm:px-5 sm:text-xs">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p>Upload a shoe photo and review the detected regions.</p>
                    <p className="sm:text-right">Results update after each model run.</p>
                </div>
            </div>
        </div>
  );
};

export default ShoeDemoTile;
