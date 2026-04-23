"use client";
import React, { useState, useRef } from 'react';
import Tile from './Tile';
import { Footprints, Upload, Loader2 } from 'lucide-react';

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
    setStatusText('INIT_PIPELINE...');
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
        const { Client } = await import("@gradio/client");
        const client = await Client.connect("badgaitintin/shoedetclss");
        const job = client.submit("/predict", [file]);

        for await (const event of job) {
            if (event.type === "status") {
                if (event.progress_data?.[0]) {
                    setPipelineProgress(Math.round(event.progress_data[0].progress * 100));
                    setStatusText(event.progress_data[0].desc || 'PROCESSING...');
                }
            } else if (event.type === "data") {
                setResult(event.data[0]);
                setLoading(false);
            }
        }
    } catch (err: any) {
        setError(err.message);
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

  return (
    <div className="w-full h-full min-h-[540px] bg-[#f8efe4]/78 text-foreground overflow-hidden flex flex-col font-mono border border-stone-200">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white/75">
            <div className="flex items-center gap-3">
                <Footprints className="text-amber-600" />
                <h2 className="text-lg font-semibold tracking-tight">Shoe_Detection.sys</h2>
            </div>
            {(result || previewUrl) && (
                <button onClick={resetState} className="border border-stone-300 px-3 py-1 text-xs hover:bg-stone-100 transition-all">
                    [ RESET ]
                </button>
            )}
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
            {!result ? (
                <div 
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 p-10 md:p-20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-stone-500 transition-all bg-white/60"
                >
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                    {previewUrl ? (
                        <div className="relative">
                            <img src={previewUrl} className="max-h-64 border border-stone-300" />
                            {loading && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
                                    <Loader2 className="animate-spin mb-2" />
                                    <div className="text-xs">{statusText.toUpperCase()}</div>
                                    <div className="w-full bg-white/20 h-1 mt-2"><div className="bg-white h-full" style={{width: `${pipelineProgress}%`}} /></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Upload size={32} className="opacity-20" />
                            <div className="text-xs font-bold">DRAG_OR_CLICK_TO_UPLOAD</div>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4 h-auto md:h-64">
                        <div className="border border-stone-300 relative p-1 bg-white/70">
                            <div className="absolute top-0 left-0 bg-white text-stone-700 border border-stone-300 text-[7px] px-1 font-bold">DETECTION_MAP</div>
                            <img src={result.annotated_image} className="w-full h-full object-contain" />
                        </div>
                        <div className="border border-stone-300 relative p-1 bg-white/70">
                            <div className="absolute top-0 left-0 bg-white text-stone-700 border border-stone-300 text-[7px] px-1 font-bold">DEPTH_ARRAY</div>
                            <img src={result.depth_map} className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
                        {result.persons?.map((p: any) => (
                            <button key={p.rank} onClick={() => setSelectedPerson(p.rank)} className={`border p-1 transition-all ${selectedPerson === p.rank ? 'border-stone-400 bg-stone-800 text-white' : 'border-stone-200 hover:border-stone-400 bg-white/70 text-stone-700'}`}>
                                <img src={p.person_crop_base64} className="w-full aspect-square object-cover" />
                                <div className="text-[8px] mt-1">P.{p.rank}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ShoeDemoTile;
