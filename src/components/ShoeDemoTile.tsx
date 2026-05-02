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

  const shellCard = 'rounded-sm border border-black/10 bg-white/40 shadow-sm';

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
    <div className="flex h-full flex-col overflow-hidden bg-[#f8f3ea] text-[#2b241d] font-sans selection:bg-black/10">
      {/* Header - Spotify Analysis Style: Clean, Mono labels, Minimal borders */}
      <div className="border-b border-black/[0.08] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Footprints className="h-5 w-5 opacity-40" />
            <div className="flex flex-col">
              <h1 className="text-sm font-medium tracking-tight opacity-90 leading-none uppercase font-mono">Vision Atlas</h1>
              <span className="mt-1 text-[10px] opacity-30 uppercase tracking-[0.2em] font-mono">Analysis Engine 2.4</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(result || previewUrl) && (
              <button 
                onClick={resetState} 
                className="text-[10px] font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid h-full gap-6 lg:grid-cols-[240px_1fr_320px]">
          
          {/* LEFT: Subjects */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">Subjects {totalPersons > 0 && `(${totalPersons})`}</div>
              
              <div className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                {!result && !loading && (
                  <div className="py-20 text-center opacity-10">
                    <Search className="mx-auto mb-2 h-5 w-5" />
                    <p className="text-[10px] font-mono uppercase tracking-widest">Idle</p>
                  </div>
                )}
                {result?.persons?.map((person: any) => (
                  <button
                    key={person.rank}
                    onClick={() => setSelectedPerson(person.rank)}
                    className={`group relative flex w-full items-center gap-3 border p-2 transition-all duration-300 ${selectedPerson === person.rank ? 'border-black/10 bg-black/[0.02]' : 'border-transparent hover:bg-black/[0.01]'}`}
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden bg-black/[0.03]">
                      <img src={person.person_crop_base64} className="h-full w-full object-cover opacity-80" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-[11px] font-medium opacity-70">P-{person.rank}</div>
                      <div className="mt-0.5 text-[9px] font-mono opacity-30 uppercase tracking-tighter">
                         {person.shoes?.length || 0} detections
                      </div>
                    </div>
                    {selectedPerson === person.rank && <div className="h-1 w-1 rounded-full bg-black/40" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: Main View */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="flex shrink-0 items-center justify-between border-b border-black/[0.05] pb-3">
              <div className="flex gap-4">
                {(['original', 'annotated', 'depth'] as const).map((m) => (
                  <button
                    key={m}
                    disabled={!result && m !== 'original'}
                    onClick={() => setViewMode(m)}
                    className={`text-[10px] font-mono uppercase tracking-[0.2em] transition-all ${viewMode === m ? 'opacity-100' : 'opacity-20 hover:opacity-40 disabled:opacity-5'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden border border-black/[0.05] bg-black/[0.01]">
              {!previewUrl && !loading && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center p-12 text-center cursor-pointer"
                >
                  <Upload size={20} className="mb-4 opacity-10 group-hover:opacity-30 transition-opacity" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-20">Import Source</p>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center animate-pulse">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-20">Analyzing...</div>
                </div>
              )}

              {previewUrl && (
                <div className="relative flex h-full w-full items-center justify-center p-8">
                  <div className="relative h-full w-full flex items-center justify-center">
                    <img 
                      src={viewMode === 'depth' ? result?.depth_map : viewMode === 'annotated' ? result?.annotated_image : previewUrl} 
                      className={`max-h-full max-w-full object-contain grayscale-[0.5] mix-blend-multiply opacity-90 transition-all duration-700 ${selectedPerson !== null ? 'opacity-20 blur-sm' : ''}`}
                    />
                    
                    {selectedPersonData && (viewMode === 'original' || viewMode === 'annotated') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="relative h-full w-full flex items-center justify-center p-8">
                            <img 
                              src={selectedPersonData.person_crop_base64} 
                              className="max-h-full max-w-full object-contain mix-blend-normal shadow-2xl animate-in fade-in zoom-in-95 duration-500" 
                            />
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Detailed Analysis */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">Diagnostic Data</div>

              <div className="flex-1 space-y-12 overflow-y-auto pr-2 custom-scrollbar">
                {selectedPersonData ? (
                  <>
                    {(['Left', 'Right'] as const).map(side => {
                      const shoe = selectedPersonData.shoes?.find((s: any) => s.side === side);
                      return (
                        <div key={side} className="flex flex-col gap-4">
                           <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                              <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">
                                Axis_{side.toUpperCase()}
                              </span>
                           </div>
                           
                           {shoe ? (
                             <div className="flex flex-col gap-6">
                               <div className="h-32 w-full overflow-hidden bg-black/[0.02] p-2 flex items-center justify-center border border-black/[0.03]">
                                  <img src={shoe.crop_base64} className="max-h-full max-w-full object-contain grayscale-[0.3]" />
                               </div>
                               
                               <div className="space-y-4">
                                  <div>
                                    <div className="text-[9px] font-mono opacity-20 uppercase tracking-widest">Classification</div>
                                    <div className="mt-1 text-sm font-medium tracking-tight opacity-80 uppercase">{shoe.brand || '---'}</div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-8">
                                     <div className="space-y-1">
                                        <div className="text-[9px] font-mono opacity-20 uppercase tracking-widest">Confidence</div>
                                        <div className="text-[11px] font-mono opacity-60">{(shoe.confidence * 100).toFixed(2)}%</div>
                                     </div>
                                     <div className="space-y-1">
                                        <div className="text-[9px] font-mono opacity-20 uppercase tracking-widest">Depth_Z</div>
                                        <div className="text-[11px] font-mono opacity-60">{shoe.depth_score?.toFixed(4)}</div>
                                     </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="text-[9px] font-mono opacity-20 uppercase tracking-widest">Visual_Clearance</div>
                                    <div className="h-0.5 w-full bg-black/[0.05]">
                                       <div className="h-full bg-black/20" style={{ width: `${(shoe.blur_score || 0) * 100}%` }} />
                                    </div>
                                  </div>
                               </div>
                             </div>
                           ) : (
                             <div className="py-4 text-[9px] font-mono opacity-10 uppercase tracking-widest">Null_Detection</div>
                           )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-5">
                    <Box size={24} />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
};

export default ShoeDemoTile;
