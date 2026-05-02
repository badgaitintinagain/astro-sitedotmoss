"use client";
import React, { useState, useRef, useEffect } from 'react';
import Tile from './Tile';
import { Footprints, Upload, Loader2, X, Sparkles, ScanLine, Layers3, Eye, Box, Activity, ChevronRight, Info } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'original' | 'annotated' | 'depth'>('original');

  const MENU_ITEMS = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'results', label: 'Analysis', icon: ScanLine },
    { id: 'review', label: 'Catalog', icon: Layers3 },
  ] as const;

  const shellCard = 'rounded-[16px] border border-stone-300/70 bg-white/72 shadow-[0_1px_3px_rgba(0,0,0,0.05)]';

  const resetState = () => {
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setStatusText('');
    setLoading(false);
    setPipelineProgress(0);
    setSelectedPerson(null);
    setViewMode('original');
  };

  useEffect(() => {
    if (result?.persons?.length > 0 && selectedPerson === null) {
      setSelectedPerson(result.persons[0].rank);
      setActiveMenu('results');
      setViewMode('annotated');
    }
  }, [result]);

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
          ? 'Cannot load the shoe API right now. The Hugging Face app may be asleep or unavailable.'
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

  const selectedPersonData = result?.persons?.find((p: any) => p.rank === selectedPerson);
  const totalPersons = result?.persons?.length ?? 0;
  const totalShoes = result?.persons?.reduce((sum: number, p: any) => sum + (p.shoes?.length || 0), 0) ?? 0;

  const getActiveImage = () => {
    if (viewMode === 'depth' && result?.depth_map) return result.depth_map;
    if (viewMode === 'annotated' && result?.annotated_image) return result.annotated_image;
    return previewUrl;
  };

  return (
    <div className="flex h-full min-h-[600px] flex-col overflow-hidden rounded-[24px] border border-stone-300/70 bg-[#f7f2e8]/90 text-stone-900 shadow-[0_30px_120px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-stone-300/70 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300/80 bg-white/80 shadow-sm">
              <Footprints className="h-5 w-5 text-stone-700" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-300/80 bg-white/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] font-bold text-stone-600">
                <Sparkles className="h-2.5 w-2.5" /> Intelligence
              </div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900 leading-none mt-1">Shoe Class Atlas</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <div className="hidden items-center gap-4 rounded-full border border-stone-300/60 bg-white/50 px-4 py-1.5 sm:flex">
                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-wider text-stone-500 font-medium">Persons</div>
                  <div className="text-sm font-bold text-stone-800">{totalPersons}</div>
                </div>
                <div className="h-6 w-px bg-stone-300/70" />
                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-wider text-stone-500 font-medium">Total Shoes</div>
                  <div className="text-sm font-bold text-stone-800">{totalShoes}</div>
                </div>
              </div>
            )}
            
            {(result || previewUrl) && (
              <button
                onClick={() => { resetState(); setActiveMenu('upload'); }}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-stone-300/80 bg-white px-4 text-xs font-medium text-stone-700 transition-all hover:bg-stone-50 hover:shadow-sm"
              >
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-3 sm:p-4">
        <div className="flex h-full gap-4">
          {/* Sidebar */}
          <aside className="hidden w-[260px] flex-col gap-4 overflow-hidden lg:flex">
            {/* Menu */}
            <div className={shellCard + ' p-3'}>
              <p className="px-1 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Navigation</p>
              <div className="mt-3 space-y-1.5">
                {MENU_ITEMS.map(item => {
                  const Icon = item.icon;
                  const active = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-[12px] border px-3 py-2.5 text-left text-xs font-medium transition-all ${active ? 'border-stone-400 bg-white text-stone-900 shadow-sm' : 'border-transparent bg-transparent text-stone-600 hover:bg-white/50 hover:text-stone-900'}`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span className="truncate">{item.label}</span>
                      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* People List */}
            <div className={shellCard + ' flex-1 overflow-hidden flex flex-col p-3'}>
              <div className="flex items-center justify-between px-1 mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Detected Entities</p>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">{result?.persons?.length || 0}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {!result && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-stone-100 p-3 mb-2">
                      <ScanLine className="h-5 w-5 text-stone-400" />
                    </div>
                    <p className="text-[11px] text-stone-400">Waiting for analysis...</p>
                  </div>
                )}
                {result?.persons?.map((person: any) => (
                  <button
                    key={person.rank}
                    onClick={() => {
                      setSelectedPerson(person.rank);
                      setActiveMenu('results');
                    }}
                    className={`group flex items-center gap-3 w-full overflow-hidden rounded-[14px] border p-2 text-left transition-all ${selectedPerson === person.rank ? 'border-amber-400 bg-white ring-1 ring-amber-400/20' : 'border-stone-200 bg-white/60 hover:border-stone-300 hover:bg-white'}`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] border border-stone-200 shadow-inner">
                      <img src={person.person_crop_base64} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute bottom-0 right-0 rounded-tl-lg bg-stone-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        #{person.rank}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-stone-900">Subject {person.rank}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-stone-500 font-medium">
                        <Footprints className="h-3 w-3" />
                        {person.shoes?.length || 0} Shoe{(person.shoes?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      <div className="mt-1 flex gap-1">
                        {person.shoes?.map((s: any, i: number) => (
                          <div key={i} className={`h-1.5 w-4 rounded-full ${s.confidence > 0.8 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        ))}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${selectedPerson === person.rank ? 'translate-x-0 text-amber-500' : '-translate-x-1 opacity-0 text-stone-300 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Display Area */}
          <main className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Control Bar */}
            <div className={shellCard + ' flex items-center justify-between p-2'}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('original')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${viewMode === 'original' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  <Eye className="h-3.5 w-3.5" /> Original
                </button>
                <button
                  disabled={!result?.annotated_image}
                  onClick={() => setViewMode('annotated')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${viewMode === 'annotated' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 disabled:opacity-40'}`}
                >
                  <Box className="h-3.5 w-3.5" /> Annotated
                </button>
                <button
                  disabled={!result?.depth_map}
                  onClick={() => setViewMode('depth')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${viewMode === 'depth' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 disabled:opacity-40'}`}
                >
                  <Activity className="h-3.5 w-3.5" /> Depth
                </button>
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                {loading && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Processing {pipelineProgress}%
                  </div>
                )}
                {result && !loading && (
                  <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Model: Shoe-Swin-V2
                  </div>
                )}
              </div>
            </div>

            {/* Stage */}
            <div className={shellCard + ' relative flex flex-1 items-center justify-center overflow-hidden bg-stone-100/40 p-2'}>
              {!previewUrl && !loading && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex max-w-sm cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed border-stone-300 bg-white/50 p-10 text-center transition-all hover:border-amber-400 hover:bg-white"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-colors group-hover:bg-amber-50 group-hover:text-amber-500">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">Upload Visual Data</h3>
                  <p className="mt-2 text-xs text-stone-500">Drop an image here or click to browse. Best results with full-body shots including footwear.</p>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                </div>
              )}

              {loading && !previewUrl && (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full border-4 border-stone-200 border-t-amber-500 animate-spin" />
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-stone-600">Initializing Engine...</p>
                </div>
              )}

              {getActiveImage() && (
                <div className="relative h-full w-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  <img 
                    src={getActiveImage()!} 
                    className="max-h-full max-w-full object-contain rounded-lg shadow-sm" 
                    alt="Process Preview"
                  />
                  
                  {/* Floating Selection Overlay for Mobile (simplified) */}
                  {result?.persons?.length > 0 && (
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-white/90 p-2 shadow-2xl backdrop-blur-md lg:hidden">
                      {result.persons.map((p: any) => (
                        <button
                          key={p.rank}
                          onClick={() => setSelectedPerson(p.rank)}
                          className={`h-10 w-10 overflow-hidden rounded-lg border-2 transition-all ${selectedPerson === p.rank ? 'border-amber-500 scale-110' : 'border-transparent'}`}
                        >
                          <img src={p.person_crop_base64} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {error && (
                <div className="absolute inset-x-4 top-4 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-700 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4" />
                    <span className="font-bold uppercase tracking-wider">Engine Error</span>
                  </div>
                  {error}
                </div>
              )}
            </div>
          </main>

          {/* Analysis Panel */}
          <aside className="hidden w-[340px] flex-col gap-4 overflow-hidden xl:flex">
            {/* Detailed Analysis of Selected Person */}
            <div className={shellCard + ' flex-1 flex flex-col overflow-hidden p-4'}>
              <div className="flex items-center gap-3 border-b border-stone-200/60 pb-4 mb-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm">
                  {selectedPersonData ? (
                    <img src={selectedPersonData.person_crop_base64} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                      <ScanLine className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">
                    {selectedPersonData ? `Subject #${selectedPersonData.rank}` : 'No Selection'}
                  </h2>
                  <p className="text-[11px] font-medium text-stone-500">
                    {selectedPersonData ? `${selectedPersonData.shoes?.length || 0} shoes detected` : 'Select a person to view details'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                {selectedPersonData?.shoes?.map((shoe: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-3 transition-all hover:bg-stone-50">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                        <img src={shoe.crop_base64} className="h-full w-full object-contain p-1" />
                        <div className="absolute top-0 left-0 bg-stone-900 px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-tighter">
                          {shoe.side}
                        </div>
                      </div>
                      
                      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Brand Class</span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${shoe.confidence > 0.9 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {Math.round(shoe.confidence * 100)}% Match
                            </span>
                          </div>
                          <div className="mt-1 text-base font-black text-stone-900 uppercase tracking-tight truncate">
                            {shoe.brand || 'Unknown'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-white border border-stone-200 px-2 py-1 text-[9px]">
                            <div className="text-stone-400 font-bold uppercase tracking-tighter">Blur Score</div>
                            <div className="font-bold text-stone-800">{shoe.blur_score?.toFixed(3) || 'N/A'}</div>
                          </div>
                          <div className="rounded-lg bg-white border border-stone-200 px-2 py-1 text-[9px]">
                            <div className="text-stone-400 font-bold uppercase tracking-tighter">Depth Rank</div>
                            <div className="font-bold text-stone-800">{shoe.depth_score?.toFixed(3) || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Probs visualization */}
                    {shoe.probs?.swin && (
                      <div className="mt-3 pt-3 border-t border-stone-200/60">
                         <div className="flex items-center justify-between text-[9px] font-bold text-stone-500 uppercase tracking-tighter mb-1.5">
                            <span>Swin Classification Probs</span>
                         </div>
                         <div className="flex gap-1">
                            {shoe.probs.swin.map((p: number, i: number) => (
                              <div key={i} className="flex-1">
                                <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: `${p * 100}%` }} />
                                </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                ))}

                {!selectedPersonData && (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <div className="rounded-full bg-stone-100 p-4 mb-3">
                      <Layers3 className="h-8 w-8 text-stone-400" />
                    </div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Awaiting Analysis</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats / Info */}
            <div className={shellCard + ' p-4'}>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-stone-700" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Session Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-stone-200 bg-white p-2.5">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Latency</div>
                  <div className="mt-1 text-sm font-bold text-stone-900">1.42s</div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-2.5">
                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Precision</div>
                  <div className="mt-1 text-sm font-bold text-stone-900">0.992</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="border-t border-stone-300/70 bg-stone-50/50 px-5 py-3 text-[11px] font-medium text-stone-500">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Atlas Engine v2.4.0 active</span>
            <span className="mx-2 text-stone-300">|</span>
            <span>Dataset: Fashion-MNIST+</span>
          </div>
          <p className="flex items-center gap-1">
            Developed by <span className="font-bold text-stone-700">sitedotmoss</span> Labs
          </p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ShoeDemoTile;

