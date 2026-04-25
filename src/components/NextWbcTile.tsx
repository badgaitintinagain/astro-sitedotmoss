"use client";
import React, { useState, useRef } from 'react';
import Tile from './Tile';
import { Microscope, Upload, Loader2 } from 'lucide-react';

interface NextWbcProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
  isFullPage?: boolean;
}

const CLASSES = ['heterophil', 'eosinophil', 'basophil', 'lymphocyte', 'monocyte', 'thrombocyte'] as const;
const CLASS_COLORS: Record<string, string> = {
  heterophil:  '#FFC800', eosinophil:  '#FF0000', basophil:    '#8000FF',
  lymphocyte:  '#00C8FF', monocyte:    '#00FF00', thrombocyte: '#C8C8C8',
};

const NextWbcTile: React.FC<NextWbcProps> = ({ size = '2x1', accent = 'primary', opacity = 40, isFullPage = false }) => {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setLoading(true);
    setStatusText('INIT_ANALYSIS...');
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
        const { Client } = await import("@gradio/client");
        const client = await Client.connect("badgaitintin/nextwbc");
        const job = client.submit("/predict", [file]);

        for await (const event of job) {
            if (event.type === "status") {
                if (event.progress_data?.[0]) {
                    setProgress(Math.round(event.progress_data[0].progress * 100));
                    setStatusText(event.progress_data[0].desc || 'SCANNING...');
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
        <Tile size={size} label="NextWBC" icon={Microscope} accentType={accent} opacity={opacity} onClick={() => window.location.href = '/nextwbc'} />
    );
  }

  return (
    <div className="w-full h-full min-h-[540px] bg-[#f7efe4]/78 text-stone-800 overflow-hidden flex flex-col font-mono border border-stone-200 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white/72">
            <div className="flex items-center gap-3">
                <Microscope className="text-accent-primary" />
                <h2 className="text-lg font-semibold tracking-tight text-stone-900">WBC Detection</h2>
            </div>
            {(result || previewUrl) && (
                <button onClick={() => {setResult(null); setPreviewUrl(null);}} className="border border-stone-200 px-3 py-1 text-xs font-semibold hover:bg-stone-100 transition-all">
                    New Scan
                </button>
            )}
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
            {!result ? (
                <div 
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-200 p-10 md:p-20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-stone-300 transition-all bg-white/55"
                >
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                    {previewUrl ? (
                        <div className="relative">
                            <img src={previewUrl} className="max-h-64 border border-white/10" />
                            {loading && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4">
                                    <Loader2 className="animate-spin mb-2" />
                                    <div className="text-xs font-semibold">{statusText || 'PROCESSING...'}</div>
                                    <div className="w-full bg-white/20 h-1 mt-2"><div className="bg-white/80 h-full" style={{width: `${progress}%`}} /></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload size={32} className="opacity-35 mx-auto mb-4 text-stone-500" />
                            <div className="text-xs font-semibold text-stone-600">Upload_Blood_Smear_Image</div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid md:grid-cols-[1fr_300px] gap-4 md:gap-6">
                        <div className="border border-stone-200 relative p-1 bg-white/70 aspect-video overflow-hidden">
                            <div className="absolute top-0 left-0 bg-white text-stone-700 border border-stone-200 text-[7px] px-1 font-bold z-10">Detection_Result</div>
                            <img src={result.annotated_image} className="w-full h-full object-contain" />
                        </div>
                        <div className="border border-stone-200 p-4 md:p-6 bg-white/70 flex flex-col gap-4">
                             <div className="text-center py-4 border-b border-stone-200">
                                 <div className="text-4xl font-semibold text-stone-900">{result.total_cells}</div>
                                 <div className="text-xs font-semibold text-stone-500">Total_Nodes_Found</div>
                             </div>
                             <div className="space-y-3">
                                 {CLASSES.map(cls => (
                                     <div key={cls} className="flex items-center gap-3">
                                         <div className="w-2 h-2" style={{backgroundColor: CLASS_COLORS[cls]}} />
                                         <span className="text-xs font-semibold flex-1 text-stone-600">{cls}</span>
                                         <span className="text-xs font-semibold text-stone-900">{result.class_counts[cls] || 0}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {result.cells?.map((c: any) => (
                            <div key={c.id} className="border border-stone-200 p-1 bg-white/70">
                                <img src={c.crop_base64} className="w-full aspect-square object-contain" />
                                <div className="text-[7px] font-semibold mt-1 truncate" style={{color: CLASS_COLORS[c.class]}}>{c.class}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default NextWbcTile;
