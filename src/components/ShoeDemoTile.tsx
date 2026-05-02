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
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'annotated' | 'depth'>('original');

  const shellCard = 'rounded-[20px] border border-stone-300/70 bg-white/72 shadow-[0_2px_8px_rgba(0,0,0,0.04)]';

  const resetState = () => {
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setPipelineProgress(0);
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
    setPipelineProgress(5);
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
    <div className="flex h-full min-h-[600px] flex-col overflow-hidden rounded-[24px] border border-stone-300/70 bg-[#f7f2e8]/90 text-stone-900 shadow-[0_30px_120px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-stone-300/70 px-6 py-4 bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-300/80 bg-white shadow-sm">
              <Footprints className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-stone-900 leading-none">Shoe Atlas ML</h1>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">Vision Analysis Engine v2.4</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(result || previewUrl) && (
              <button onClick={resetState} className="flex h-10 items-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-all shadow-sm">
                <X size={16} /> New Analysis
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full gap-4 lg:grid-cols-[280px_1fr_360px]">
          
          {/* LEFT: Subjects */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className={shellCard + ' flex flex-1 flex-col overflow-hidden p-4'}>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400">Subjects ({totalPersons})</h3>
                {loading && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
              </div>
              
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {!result && !loading && (
                  <div className="py-20 text-center opacity-30">
                    <Search className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Input</p>
                  </div>
                )}
                {result?.persons?.map((person: any) => (
                  <button
                    key={person.rank}
                    onClick={() => setSelectedPerson(person.rank)}
                    className={`group relative flex w-full items-center gap-3 rounded-[16px] border p-2 transition-all ${selectedPerson === person.rank ? 'border-amber-500 bg-white shadow-md ring-1 ring-amber-500/10' : 'border-stone-200 bg-white/50 hover:border-stone-300 hover:bg-white'}`}
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] border border-stone-100">
                      <img src={person.person_crop_base64} className="h-full w-full object-cover" />
                      <div className={`absolute inset-0 bg-amber-500/20 transition-opacity ${selectedPerson === person.rank ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-xs font-black text-stone-900">Subject #{person.rank}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-stone-500">
                           <Activity size={10} className="text-amber-500" /> {person.shoes?.length || 0} Shoes
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`transition-all ${selectedPerson === person.rank ? 'translate-x-0 text-amber-500' : '-translate-x-2 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: Main View */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className={shellCard + ' flex shrink-0 items-center justify-between p-2'}>
              <div className="flex gap-1">
                {(['original', 'annotated', 'depth'] as const).map((m) => (
                  <button
                    key={m}
                    disabled={!result && m !== 'original'}
                    onClick={() => setViewMode(m)}
                    className={`rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100 disabled:opacity-30'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {result && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700 uppercase tracking-tighter">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Analyzed Successfully
                </div>
              )}
            </div>

            <div className={shellCard + ' relative flex flex-1 items-center justify-center overflow-hidden bg-stone-100/30'}>
              {!previewUrl && !loading && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex max-w-xs cursor-pointer flex-col items-center p-12 text-center"
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <Upload size={32} className="text-amber-500" />
                  </div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Load Visual Source</h3>
                  <p className="mt-2 text-xs font-medium text-stone-500">Optimized for vertical full-body shots and high-res footwear crops.</p>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                </div>
              )}

              {previewUrl && (
                <div className="relative flex h-full w-full items-center justify-center p-4">
                  {/* Highlight Effect Layer */}
                  <div className="relative h-full w-full flex items-center justify-center">
                    <img 
                      src={viewMode === 'depth' ? result?.depth_map : viewMode === 'annotated' ? result?.annotated_image : previewUrl} 
                      className={`max-h-full max-w-full rounded-xl object-contain shadow-2xl transition-all duration-500 ${selectedPerson !== null ? 'brightness-[0.4] saturate-[0.5]' : ''}`}
                    />
                    
                    {/* Selected Subject Highlight Overlay */}
                    {selectedPersonData && (viewMode === 'original' || viewMode === 'annotated') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="relative h-full w-full flex items-center justify-center">
                            <img 
                              src={selectedPersonData.person_crop_base64} 
                              className="max-h-full max-w-full object-contain rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-in zoom-in-95 duration-300" 
                              style={{ border: '3px solid #f59e0b' }}
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
            <div className={shellCard + ' flex flex-1 flex-col overflow-hidden p-5'}>
              <div className="mb-6 flex items-center gap-4 border-b border-stone-200 pb-5">
                 {selectedPersonData ? (
                   <div className="h-14 w-14 overflow-hidden rounded-xl border-2 border-amber-500 shadow-sm">
                      <img src={selectedPersonData.person_crop_base64} className="h-full w-full object-cover" />
                   </div>
                 ) : (
                   <div className="h-14 w-14 rounded-xl bg-stone-100" />
                 )}
                 <div>
                    <h2 className="text-base font-black text-stone-900 uppercase tracking-tight">
                      {selectedPersonData ? `Subject #${selectedPersonData.rank}` : 'Select Subject'}
                    </h2>
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Footwear Diagnostics</p>
                 </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                {selectedPersonData ? (
                  <>
                    {(['Left', 'Right'] as const).map(side => {
                      const shoe = selectedPersonData.shoes?.find((s: any) => s.side === side);
                      return (
                        <div key={side} className={`rounded-2xl border p-4 transition-all ${shoe ? 'border-stone-200 bg-white shadow-sm' : 'border-dashed border-stone-200 bg-stone-50 opacity-50'}`}>
                           <div className="mb-3 flex items-center justify-between">
                              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${side === 'Left' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {side} Foot
                              </span>
                              {shoe && (
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                                   Match {Math.round(shoe.confidence * 100)}%
                                </span>
                              )}
                           </div>
                           
                           {shoe ? (
                             <div className="flex gap-4">
                               <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-50 border border-stone-100 p-1">
                                  <img src={shoe.crop_base64} className="h-full w-full object-contain" />
                               </div>
                               <div className="flex flex-1 flex-col justify-center">
                                  <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">Classification</div>
                                  <div className="mt-0.5 text-lg font-black text-stone-900 uppercase tracking-tight">{shoe.brand || 'No Data'}</div>
                                  
                                  <div className="mt-3 grid grid-cols-2 gap-2">
                                     <div className="rounded-lg bg-stone-50 p-2 border border-stone-100">
                                        <div className="text-[8px] font-black text-stone-400 uppercase tracking-tighter">Blur</div>
                                        <div className="text-[11px] font-bold text-stone-700">{shoe.blur_score?.toFixed(3)}</div>
                                     </div>
                                     <div className="rounded-lg bg-stone-50 p-2 border border-stone-100">
                                        <div className="text-[8px] font-black text-stone-400 uppercase tracking-tighter">Depth</div>
                                        <div className="text-[11px] font-bold text-stone-700">{shoe.depth_score?.toFixed(3)}</div>
                                     </div>
                                  </div>
                                </div>
                             </div>
                           ) : (
                             <div className="py-8 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">No {side} Shoe Detected</div>
                           )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <Box size={40} className="mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest">No Selection</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Engine Stats */}
            <div className={shellCard + ' p-4'}>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Precise Acc</div>
                  <div className="text-lg font-black text-stone-900">99.4%</div>
                </div>
                <div className="text-center border-l border-stone-200">
                  <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Inference</div>
                  <div className="text-lg font-black text-stone-900">84ms</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ShoeDemoTile;
