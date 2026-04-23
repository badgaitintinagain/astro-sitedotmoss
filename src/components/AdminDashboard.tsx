"use client";
import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Search,
    Grid, List, ExternalLink, Database, Activity
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
  tags: string[];
  coverImage?: string;
  images: string[];
  authorName: string;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = [...posts];
    if (filterStatus === 'published') filtered = filtered.filter(p => p.published);
    else if (filterStatus === 'draft') filtered = filtered.filter(p => !p.published);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    setFilteredPosts(filtered);
  }, [posts, searchQuery, filterStatus]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog/posts/all');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/blog/posts/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !current }),
      });
      if (res.ok) fetchPosts();
    } catch (err) { console.error(err); }
  };

  const deletePost = async (id: string) => {
    if (!confirm('CONFIRM_DELETION?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    draft: posts.filter(p => !p.published).length,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85)_0%,rgba(250,242,230,0.70)_30%,rgba(236,229,216,0.88)_100%)] text-stone-800 font-mono selection:bg-accent-primary/20 selection:text-stone-900">
        <header className="border-b border-stone-200/80 p-4 bg-white/60 sticky top-0 z-40 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.7)]">
            <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-stone-200 flex items-center justify-center bg-white/75 shadow-inner">
                        <Database size={14} className="text-accent-primary" />
                    </div>
                    <div>
                        <div className="text-[8px] font-bold text-stone-500 uppercase tracking-[0.2em]">ADMIN_TERMINAL</div>
                        <h1 className="text-xs font-bold text-stone-800 uppercase tracking-tight">DATACLUSTER_MANAGER</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.location.href = '/admin/new'} className="px-3 py-1.5 bg-white/70 border border-stone-200 text-stone-700 text-[9px] font-bold rounded uppercase hover:bg-white transition-all flex items-center gap-2 shadow-sm">
                        <Plus size={12} /> NEW_ENTRY
                    </button>
                    <button onClick={() => window.location.href = '/blog'} className="px-3 py-1.5 bg-white/70 border border-stone-200 text-stone-600 text-[9px] font-bold rounded uppercase hover:text-stone-800 hover:bg-white transition-all flex items-center gap-2 shadow-sm">
                        <ExternalLink size={12} /> VIEW_LIVE
                    </button>
                </div>
            </div>
        </header>

        <main className="max-w-5xl mx-auto p-4 space-y-6">
            {/* Compact Stats */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'TOTAL', value: stats.total, color: 'border-stone-200' },
                    { label: 'LIVE', value: stats.published, color: 'border-emerald-200 text-emerald-700' },
                    { label: 'DRAFT', value: stats.draft, color: 'border-amber-200 text-amber-700' },
                ].map((s, i) => (
                    <div key={i} className={`px-3 py-2 border bg-white/60 rounded ${s.color} flex justify-between items-end shadow-sm`}>
                        <span className="text-[7px] font-bold text-stone-500 uppercase tracking-widest">{s.label}</span>
                        <span className="text-sm font-bold leading-none text-stone-800">{s.value.toString().padStart(2, '0')}</span>
                    </div>
                ))}
            </div>

            {/* Compact Controls */}
            <div className="flex gap-2 items-center bg-white/60 border border-stone-200 p-1.5 rounded shadow-sm backdrop-blur-md">
                <div className="relative flex-1">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="FILTER_NODES..." 
                        className="w-full bg-transparent pl-8 pr-3 py-1 text-[10px] font-bold text-stone-800 focus:outline-none placeholder:text-stone-400 uppercase"
                    />
                </div>
                <div className="h-4 w-[1px] bg-stone-200 mx-1"></div>
                <div className="flex gap-0.5">
                    {(['all', 'published', 'draft'] as const).map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-2 py-1 text-[8px] font-bold rounded uppercase transition-all ${filterStatus === f ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="h-4 w-[1px] bg-stone-200 mx-1"></div>
                <div className="flex gap-0.5">
                    <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'text-accent-primary bg-white shadow-sm' : 'text-stone-500'}`}>
                        <Grid size={12} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'text-accent-primary bg-white shadow-sm' : 'text-stone-500'}`}>
                        <List size={12} />
                    </button>
                </div>
            </div>

            {/* List/Grid Content */}
            {loading ? (
                <div className="py-20 text-center text-[9px] text-stone-500 uppercase animate-pulse">SYNCHRONIZING...</div>
            ) : viewMode === 'list' ? (
                <div className="space-y-1.5">
                    {filteredPosts.map(post => (
                        <div key={post.id} className={`flex items-center gap-3 p-2 bg-white/70 border border-stone-200 rounded hover:border-stone-300 transition-all group shadow-sm ${deletingId === post.id ? 'opacity-30' : ''}`}>
                            <div className="w-10 h-10 bg-white border border-stone-200 overflow-hidden flex-shrink-0">
                                {post.coverImage ? (
                                    <img src={post.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400"><Database size={14} /></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[10px] font-bold text-stone-800 uppercase truncate tracking-tight">{post.title}</h3>
                                    <span className={`text-[6px] font-bold px-1 py-0.5 rounded border uppercase flex-shrink-0 ${post.published ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                                        {post.published ? 'LIVE' : 'DRAFT'}
                                    </span>
                                </div>
                                <div className="flex gap-3 mt-0.5 text-[8px] text-stone-500 uppercase">
                                    <span>REF: {post.id.substring(0, 8)}</span>
                                    <span className="opacity-40">/</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                <button onClick={() => window.location.href = `/admin/edit/${post.id}`} className="p-1.5 text-stone-500 hover:text-accent-primary transition-colors">
                                    <Edit size={12} />
                                </button>
                                <button onClick={() => togglePublish(post.id, post.published)} className={`p-1.5 transition-colors ${post.published ? 'text-emerald-600' : 'text-stone-500 hover:text-stone-700'}`}>
                                    {post.published ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>
                                <button onClick={() => deletePost(post.id)} className="p-1.5 text-stone-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white/70 border border-stone-200 rounded overflow-hidden group shadow-sm">
                            <div className="aspect-square bg-white relative border-b border-stone-200">
                                {post.coverImage && <img src={post.coverImage} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" alt="" />}
                                <div className="absolute top-1.5 left-1.5">
                                    <span className={`text-[6px] font-bold px-1 py-0.5 rounded border uppercase ${post.published ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                                        {post.published ? 'LIVE' : 'DRAFT'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 space-y-2">
                                <h3 className="text-[9px] font-bold text-stone-700 uppercase truncate group-hover:text-stone-800 transition-colors">{post.title}</h3>
                                <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-stone-200">
                                    <div className="flex gap-0.5">
                                        <button onClick={() => window.location.href = `/admin/edit/${post.id}`} className="p-1 text-stone-500 hover:text-stone-800 transition-all"><Edit size={10} /></button>
                                        <button onClick={() => togglePublish(post.id, post.published)} className="p-1 text-stone-500 hover:text-stone-800 transition-all">{post.published ? <EyeOff size={10} /> : <Eye size={10} />}</button>
                                    </div>
                                    <button onClick={() => deletePost(post.id)} className="p-1 text-red-500/40 hover:text-red-600 transition-all"><Trash2 size={10} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    </div>
  );
}
