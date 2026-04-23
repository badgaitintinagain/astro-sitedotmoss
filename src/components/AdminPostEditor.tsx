"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Plus, Layers, Send, Save, Trash2, Cpu } from 'lucide-react';

interface AdminPostEditorProps {
  postId?: string;
}

export default function AdminPostEditor({ postId }: AdminPostEditorProps) {
  const [step, setStep] = useState<'images' | 'edit'>('images');
  const [images, setImages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        const post = data.post;
        setTitle(post.title);
        setExcerpt(post.excerpt || '');
        setContent(post.content);
        setImages(post.images || []);
        setTags(post.tags?.join(', ') || '');
      }
    } catch (err) {
      console.error('Fetch post error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) return;
    const toUpload = Array.from(files).slice(0, remaining);
    
    setUploading(true);
    for (const file of toUpload) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/blog/upload-image', { method: 'POST', body: fd });
        if (res.ok) {
          const data = await res.json();
          setImages(prev => [...prev, data.url].slice(0, 5));
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (activeIndex >= next.length) setActiveIndex(Math.max(0, next.length - 1));
      return next;
    });
  };

  const handleSubmit = async (publishNow: boolean) => {
    if (!title.trim()) { alert('Title required'); return; }
    setLoading(true);
    try {
      const url = postId ? `/api/blog/posts/${postId}` : '/api/blog/create';
      const method = postId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || ' ',
          excerpt: excerpt.trim(),
          coverImage: images[0] || '',
          images,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          published: publishNow,
        }),
      });
      
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      alert('System error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1c18] text-stone-300 font-mono text-[10px]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#1a1c18]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-2.5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2 p-1.5 text-stone-600 hover:text-white transition-colors border border-white/5 bg-black/20"
            >
                <ArrowLeft size={12} />
                <span className="font-bold uppercase tracking-tighter">BACK</span>
            </button>

            <div className="h-4 w-[1px] bg-white/5 hidden sm:block"></div>

            <div className="flex items-center gap-1.5">
                <button 
                    onClick={() => setStep('images')}
                    className={`font-bold uppercase tracking-widest px-2.5 py-1 rounded transition-all ${step === 'images' ? 'bg-white/5 text-white' : 'text-stone-700'}`}
                >
                    01_IMG
                </button>
                <button 
                    onClick={() => setStep('edit')}
                    className={`font-bold uppercase tracking-widest px-2.5 py-1 rounded transition-all ${step === 'edit' ? 'bg-white/5 text-white' : 'text-stone-700'}`}
                >
                    02_DATA
                </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
                onClick={() => handleSubmit(false)} 
                disabled={loading}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-stone-500 font-bold rounded uppercase hover:text-white transition-all"
            >
                <Save size={12} /> DRAFT
            </button>
            <button 
                onClick={() => handleSubmit(true)} 
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-bold rounded uppercase hover:bg-accent-primary/20 transition-all"
            >
                <Send size={12} /> {postId ? 'UPDATE' : 'PUBLISH'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-46px)] overflow-hidden">
        {/* Left: Images */}
        <div className={`lg:w-3/5 bg-black/30 flex flex-col border-r border-white/5 ${step === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 relative flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]">
                {images.length > 0 ? (
                    <div className="relative w-full h-full max-h-[500px]">
                        <img src={images[activeIndex]} className="w-full h-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700" alt="Preview" />
                        
                        {activeIndex > 0 && (
                            <button onClick={() => setActiveIndex(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 border border-white/5 rounded-full flex items-center justify-center text-white opacity-40 hover:opacity-100">
                                <ChevronLeft size={16} />
                            </button>
                        )}
                        {activeIndex < images.length - 1 && (
                            <button onClick={() => setActiveIndex(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 border border-white/5 rounded-full flex items-center justify-center text-white opacity-40 hover:opacity-100">
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center space-y-3 opacity-20">
                        <Cpu size={32} className="mx-auto" />
                        <p className="font-bold uppercase tracking-[0.2em]">BUFFER_EMPTY</p>
                        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-1.5 border border-white/20 text-white text-[8px] font-bold rounded hover:bg-white/10 transition-all">
                            LOAD_DATA
                        </button>
                    </div>
                )}
            </div>

            {/* Compact Thumbnails */}
            <div className="h-20 bg-black/40 border-t border-white/5 p-3 flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                    <div key={i} onClick={() => setActiveIndex(i)} className={`relative w-14 h-full flex-shrink-0 border transition-all cursor-pointer rounded overflow-hidden ${activeIndex === i ? 'border-accent-primary scale-105' : 'border-white/5 opacity-30'}`}>
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/80 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                            <X size={8} />
                        </button>
                    </div>
                ))}
                {images.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()} className="w-14 h-full flex-shrink-0 border border-dashed border-white/5 rounded flex items-center justify-center text-stone-700 hover:text-stone-400 hover:border-white/10 transition-all">
                        {uploading ? <div className="w-3 h-3 border-2 border-stone-800 border-t-white rounded-full animate-spin"></div> : <Plus size={16} />}
                    </button>
                )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
        </div>

        {/* Right: Details */}
        <div className={`lg:w-2/5 flex flex-col ${step === 'images' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-5 space-y-5 flex-1 overflow-y-auto no-scrollbar">
                <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">01_IDENTIFIER::TITLE</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="ENTRY_NAME..." 
                        className="w-full bg-black/20 border border-white/5 px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-accent-primary/20 transition-colors uppercase placeholder:text-stone-800"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">02_METADATA::EXCERPT</label>
                    <textarea 
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="LOG_SUMMARY..." 
                        rows={2}
                        className="w-full bg-black/20 border border-white/5 px-3 py-2 text-[10px] font-bold text-stone-500 focus:outline-none focus:border-accent-primary/20 transition-colors uppercase placeholder:text-stone-800 resize-none"
                    />
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                    <label className="text-[8px] font-bold text-stone-600 uppercase tracking-widest flex justify-between">
                        <span>03_RAW_DATA::MARKDOWN</span>
                        <span className="opacity-40">{content.length}b</span>
                    </label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="DATA_STREAM..." 
                        className="w-full flex-1 bg-black/20 border border-white/5 px-3 py-2 text-[10px] font-mono text-stone-400 focus:outline-none focus:border-accent-primary/20 transition-colors placeholder:text-stone-800 resize-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-stone-600 uppercase tracking-widest">04_CLASSIFICATION::TAGS</label>
                    <input 
                        type="text" 
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="TAG_NODES..." 
                        className="w-full bg-black/20 border border-white/5 px-3 py-2 text-[10px] font-bold text-accent-primary focus:outline-none focus:border-accent-primary/20 transition-colors uppercase placeholder:text-stone-800"
                    />
                </div>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden p-4 border-t border-white/5 bg-black/40 grid grid-cols-2 gap-3">
                <button onClick={() => handleSubmit(false)} className="py-2.5 bg-white/5 border border-white/5 text-stone-600 font-bold rounded uppercase">DRAFT</button>
                <button onClick={() => handleSubmit(true)} className="py-2.5 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-bold rounded uppercase">PUBLISH</button>
            </div>
        </div>
      </main>
    </div>
  );
}
