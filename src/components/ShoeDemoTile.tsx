"use client";
import React, { useState, useRef, useEffect } from 'react';
import Tile from './Tile';
import { Footprints, Upload, Loader2, X, Sparkles, Box, Activity, ChevronRight, Info, Search } from 'lucide-react';

interface ShoeDemoProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
  isFullPage?: boolean;
}

const ShoeDemoTile: React.FC<ShoeDemoProps> = ({ size = '2x2', accent = 'secondary', opacity = 40, isFullPage = false }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'annotated' | 'depth'>('original');

  const shellCard = 'rounded-[14px] border border-stone-300/70 bg-white/72 shadow-[0_1px_0_rgba(255,255,255,0.6)]';

  const resetState = () => {
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setSelectedPerson(null);
    setViewMode('original');
  };

  useEffect(() => {
    if (result?.persons?.length > 0 && selectedPerson === null) {
      setSelectedPerson(result.persons[0].rank);
      setViewMode('annotated');
    }
  }, [result]);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('input_image', file);
      const response = await fetch('/api/shoe-demo', { method: 'POST', body: formData });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Connection failed');
      setResult(payload.data);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
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

  const selectedPersonData = result?.persons?.find((p: any) => p.rank === selectedPerson);
  const totalPersons = result?.persons?.length ?? 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-stone-300/70 bg-[#f7f2e8]/88 text-stone-900 shadow-[0_26px_100px_rgba(0,0,0,0.15)] backdrop-blur-md">
      <div className="border-b border-stone-300/70 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-700">
              <Sparkles className="h-3 w-3" /> Vision Atlas
            </div>
            <p className="mt-1 text-xs text-stone-600">Uploads {previewUrl ? 1 : 0} • Subjects {totalPersons}</p>
          </div>

          {(result || previewUrl) && (
            <button
              onClick={resetState}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:bg-white hover:text-stone-900"
            >
              <X className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
        <div className="grid h-full gap-2 overflow-hidden lg:grid-cols-[220px_minmax(0,1.2fr)_300px]">
          <aside className={shellCard + ' p-3 overflow-hidden'}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Subjects</p>
            <div className="mt-2 h-full space-y-1.5 overflow-y-auto pr-1">
              {!result && !loading && (
                <div className="py-16 text-center text-xs text-stone-400">
                  <Search className="mx-auto mb-2 h-4 w-4" />
                  Waiting for upload
                </div>
              )}
              {result?.persons?.map((person: any) => (
                <button
                  key={person.rank}
                  onClick={() => setSelectedPerson(person.rank)}
                  className={`flex w-full items-center gap-3 rounded-[10px] border px-2.5 py-2 text-left text-xs transition-colors ${selectedPerson === person.rank ? 'border-stone-300/90 bg-white text-stone-900' : 'border-stone-300/70 bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900'}`}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[8px] border border-stone-200 bg-white">
                    <img src={person.person_crop_base64} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium">P-{person.rank}</div>
                    <div className="mt-0.5 text-[10px] text-stone-500">{person.shoes?.length || 0} detections</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0 space-y-2 overflow-hidden">
            <div className={shellCard + ' p-3'}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Upload</p>
                  <h3 className="mt-1 text-base font-semibold text-stone-900">Shoe scan</h3>
                </div>
                <div className="flex items-center gap-2">
                  {(['original', 'annotated', 'depth'] as const).map((m) => (
                    <button
                      key={m}
                      disabled={!result && m !== 'original'}
                      onClick={() => setViewMode(m)}
                      className={`rounded-full border border-stone-300/80 bg-white/90 px-2 py-0.5 text-[10px] text-stone-700 transition-colors ${viewMode === m ? 'border-stone-300/90 text-stone-900' : 'opacity-60 hover:opacity-100 disabled:opacity-30'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

              <div
                onClick={() => !loading && fileInputRef.current?.click()}
                className="mt-3 flex min-h-[260px] cursor-pointer items-center justify-center rounded-[12px] border border-dashed border-stone-300/80 bg-white/80 p-5 text-center transition-colors hover:bg-white"
              >
                {!previewUrl && !loading && (
                  <div className="text-center">
                    <Upload size={30} className="mb-3 text-stone-500" />
                    <div className="text-xs uppercase tracking-[0.18em] text-stone-600">Upload image</div>
                    <div className="mt-1 text-xs text-stone-500">Drop or click to analyze a full shot.</div>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-5 w-5 animate-spin text-stone-500" />
                    <div className="text-xs text-stone-600">Analyzing...</div>
                  </div>
                )}

                {previewUrl && (
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[12px] border border-stone-300/70 bg-stone-100/70">
                    <img
                      src={viewMode === 'depth' ? result?.depth_map : viewMode === 'annotated' ? result?.annotated_image : previewUrl}
                      className={`max-h-[360px] max-w-full object-contain ${selectedPerson !== null && viewMode === 'annotated' ? 'opacity-30 blur-[1px]' : ''}`}
                    />
                    {selectedPersonData && viewMode === 'annotated' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={selectedPersonData.person_crop_base64}
                          className="max-h-[280px] max-w-[70%] object-contain shadow-2xl"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-3 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-2 overflow-hidden">
            <div className={shellCard + ' p-3'}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Diagnostic Data</p>
              <div className="mt-2 space-y-4 overflow-y-auto pr-1">
                {selectedPersonData ? (
                  (['Left', 'Right'] as const).map((side) => {
                    const shoe = selectedPersonData.shoes?.find((s: any) => s.side === side);
                    return (
                      <div key={side} className="rounded-[12px] border border-stone-300/70 bg-white/85 p-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Axis {side}</div>
                        {shoe ? (
                          <div className="mt-2 space-y-3">
                            <div className="h-24 w-full overflow-hidden rounded-[10px] border border-stone-200 bg-white">
                              <img src={shoe.crop_base64} className="h-full w-full object-contain" />
                            </div>
                            <div className="text-xs text-stone-700">
                              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Classification</div>
                              <div className="mt-1 text-sm font-semibold text-stone-900">{shoe.brand || '---'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-stone-700">
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Confidence</div>
                                <div className="mt-1 text-sm font-semibold text-stone-900">{(shoe.confidence * 100).toFixed(2)}%</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Depth</div>
                                <div className="mt-1 text-sm font-semibold text-stone-900">{shoe.depth_score?.toFixed(4)}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Clarity</div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200/80">
                                <div className="h-full rounded-full bg-stone-400" style={{ width: `${(shoe.blur_score || 0) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-stone-500">No detection</div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[12px] border border-stone-300/70 bg-white/80 p-4 text-sm text-stone-600">
                    Select a subject to see details.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ShoeDemoTile;
