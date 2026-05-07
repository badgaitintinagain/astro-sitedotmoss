"use client";
import React, { useState, useRef } from 'react';
import Tile from './Tile';
import { Microscope, Upload, Loader2, X, Sparkles, ScanLine, Shapes } from 'lucide-react';

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

const shellCard = 'rounded-[14px] border border-stone-300/70 bg-white/72 shadow-[0_1px_0_rgba(255,255,255,0.6)]';

const NextWbcTile: React.FC<NextWbcProps> = ({ size = '2x1', accent = 'primary', opacity = 40, isFullPage = false }) => {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [showAnnotated, setShowAnnotated] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setLoading(true);
        setStatusText('Scanning image');
        setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
        const { Client } = await import("@gradio/client");
        // Use the direct Space URL to avoid metadata fetch failures on restricted origins
        const client = await Client.connect("https://badgaitintin-nextwbc.hf.space");
        const job = client.submit("/predict", [file]);

        for await (const event of job) {
            if (event.type === "status") {
                if (event.progress_data?.[0]) {
                    setProgress(Math.round(event.progress_data[0].progress * 100));
                    setStatusText(event.progress_data[0].desc || 'Scanning image');
                }
            } else if (event.type === "data") {
                setResult(event.data[0]);
                setLoading(false);
            }
        }
    } catch (err: any) {
        const message = err?.message || 'Failed to process image.';
        setError(message);
        setLoading(false);
    }
  };

  if (!isFullPage) {
    return (
        <Tile size={size} label="NextWBC" icon={Microscope} accentType={accent} opacity={opacity} onClick={() => window.location.href = '/nextwbc'} />
    );
  }

    const totalCells = result?.total_cells ?? 0;
    const classCounts = result?.class_counts ?? {};
    const detectedClasses = CLASSES.filter(cls => (classCounts[cls] ?? 0) > 0).length;

    const resultSummary = [
        { label: 'Cells', value: totalCells },
        { label: 'Classes', value: detectedClasses },
        { label: 'Ready', value: result ? 'Yes' : 'No' }
    ];

  return (
        <div className="flex h-full min-h-[540px] flex-col overflow-hidden rounded-[22px] border border-stone-300/70 bg-[#f7f2e8]/88 text-stone-900 shadow-[0_26px_100px_rgba(0,0,0,0.15)] backdrop-blur-md">
            <div className="border-b border-stone-300/70 px-4 py-3 sm:px-5 sm:py-3.5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-700">
                            <Sparkles className="h-3 w-3" /> Cell Scan Atlas
                        </div>
                        <p className="mt-1 text-xs text-stone-600">Uploads {previewUrl ? 1 : 0} • Cells {totalCells} • Classes {detectedClasses}</p>
                    </div>

                    {(result || previewUrl) && (
                        <button
                            onClick={() => { setResult(null); setPreviewUrl(null); setError(null); setStatusText(''); setProgress(0); }}
                            className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:bg-white hover:text-stone-900"
                        >
                            <X className="h-3.5 w-3.5" /> Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
                <div className="flex h-full gap-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="grid h-full gap-2 overflow-y-auto pr-1 lg:grid-cols-[minmax(0,1.25fr)_290px]">
                            <section className="space-y-2">
                                <div className={shellCard + ' p-3'}>
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Upload</p>
                                            <h3 className="mt-1 text-base font-semibold text-stone-900">Blood smear scan</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {result?.annotated_image && (
                                                <button
                                                    onClick={() => setShowAnnotated((prev) => !prev)}
                                                    className="rounded-full border border-stone-300/80 bg-white/90 px-2 py-0.5 text-[10px] text-stone-700"
                                                >
                                                    {showAnnotated ? 'Annotated' : 'Original'}
                                                </button>
                                            )}
                                            <span className="rounded-full border border-stone-300/80 bg-white/90 px-2 py-0.5 text-[10px] text-stone-700">
                                                {loading ? `${progress}%` : result ? 'Done' : 'Ready'}
                                            </span>
                                        </div>
                                    </div>

                                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

                                    <div
                                        onClick={() => !loading && fileInputRef.current?.click()}
                                        className="mt-3 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-stone-300/80 bg-white/80 p-5 text-center transition-colors hover:bg-white"
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full max-w-[520px] overflow-hidden rounded-[12px] border border-stone-300/70 bg-stone-100/70">
                                                <img
                                                    src={showAnnotated && result?.annotated_image ? result.annotated_image : previewUrl}
                                                    className="max-h-[280px] w-full object-contain"
                                                />
                                                {loading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-white">
                                                        <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                                                        <div className="text-xs font-medium">{statusText || 'Scanning image'}</div>
                                                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
                                                            <div className="h-full rounded-full bg-white/85 transition-all" style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={30} className="mb-3 text-stone-500" />
                                                <div className="text-xs uppercase tracking-[0.18em] text-stone-600">Upload image</div>
                                                <div className="mt-1 text-xs text-stone-500">Drop or click to open a smear image.</div>
                                            </>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mt-3 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                <div className={shellCard + ' p-3'}>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Crops</p>
                                    {result?.cells?.length > 0 ? (
                                        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                                            {result.cells.map((cell: any) => (
                                                <div key={cell.id} className="rounded-[10px] border border-stone-300/70 bg-white/85 p-1.5">
                                                    <img src={cell.crop_base64} className="aspect-square w-full object-contain" />
                                                    <div className="mt-1 truncate text-[10px] text-stone-600" style={{ color: CLASS_COLORS[cell.class] }}>
                                                        {cell.class}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-2 rounded-[12px] border border-stone-300/70 bg-white/80 p-4 text-sm text-stone-600">
                                            No crops yet. Upload an image to view cells.
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="space-y-2">
                                <div className={shellCard + ' p-3'}>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">Results</p>
                                    {result ? (
                                        <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_240px]">
                                            <div className="overflow-hidden rounded-[12px] border border-stone-300/70 bg-stone-100/70 p-1">
                                                <img src={result.annotated_image} className="h-full w-full object-contain" />
                                            </div>

                                            <div className="rounded-[12px] border border-stone-300/70 bg-white/85 p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <div className="text-xs text-stone-600">Cell count</div>
                                                        <div className="text-3xl font-semibold text-stone-900">{result.total_cells}</div>
                                                    </div>
                                                    <span className="rounded-full border border-stone-300/80 bg-white px-2 py-0.5 text-[10px] text-stone-700">Detected</span>
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    {CLASSES.map(cls => (
                                                        <div key={cls} className="rounded-[10px] border border-stone-300/70 bg-white/80 px-2.5 py-2">
                                                            <div className="mb-1 flex items-center justify-between text-xs text-stone-700">
                                                                <span className="inline-flex items-center gap-2">
                                                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CLASS_COLORS[cls] }} />
                                                                    {cls}
                                                                </span>
                                                                <span className="text-stone-900">{classCounts[cls] || 0}</span>
                                                            </div>
                                                            <div className="h-1.5 overflow-hidden rounded-full bg-stone-200/80">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-500"
                                                                    style={{ width: `${totalCells > 0 ? ((classCounts[cls] || 0) / totalCells) * 100 : 0}%`, backgroundColor: CLASS_COLORS[cls] }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 rounded-[12px] border border-stone-300/70 bg-white/80 p-4 text-sm text-stone-600">
                                            Upload an image to view the scan.
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-300/70 px-4 py-2.5 text-[11px] text-stone-500 sm:px-5 sm:text-xs">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p>Upload a smear image and review the detected classes.</p>
                    <p className="sm:text-right">Model output updates after each scan.</p>
                </div>
            </div>
        </div>
  );
};

export default NextWbcTile;
