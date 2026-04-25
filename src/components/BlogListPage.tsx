"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Heart, MessageCircle, Layers, Search, Grid, List, Terminal, Database, Activity, Cpu } from 'lucide-react';
import BlogModal from './BlogModal';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  images: string[];
  authorName: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
  commentsCount?: number;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(p => p.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTag) {
      result = result.filter(p => p.tags?.includes(selectedTag));
    }
    return result;
  }, [posts, searchQuery, selectedTag]);

  const hasFilters = searchQuery || selectedTag;

  return (
    <div className="min-h-screen text-stone-800 font-mono selection:bg-accent-primary/20 selection:text-stone-900 relative overflow-hidden md:pl-2">
      {/* Blueprint Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.08]" 
           style={{ backgroundImage: 'radial-gradient(rgba(108,86,67,0.35) 0.65px, transparent 0.65px)', backgroundSize: '20px 24px' }}>
      </div>
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(197,174,148,0.22)_50%)] bg-[length:100%_2px]"></div>

      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/72 backdrop-blur-xl">
        <div className="max-w-[900px] mx-auto px-4">
          <div className="flex items-center justify-between py-3 relative">
            <div className="flex items-center gap-4">
                <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center w-7 h-7 border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-800 bg-white/70 transition-all"
                >
                <ArrowLeft size={14} />
                </button>
                
                <div className="flex flex-col">
                    <h1 className="text-[10px] font-bold tracking-[0.2em] text-stone-800 uppercase flex items-center gap-2">
                        <Terminal size={12} className="text-accent-primary" />
                        Archive Log
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-1">
                 <span className="text-[8px] text-stone-500 font-bold uppercase">Posts: {posts.length}</span>
              </div>
              <div className="flex items-center gap-0.5 border border-stone-200 bg-white/70 p-0.5">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 transition-all ${viewMode === 'grid' ? 'text-accent-primary bg-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    <Grid size={12} />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 transition-all ${viewMode === 'list' ? 'text-accent-primary bg-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    <List size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="pb-3 flex gap-3 items-center border-t border-stone-200/80 pt-3">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="QUERY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-white/78 border border-stone-200 text-[10px] font-bold text-stone-800 focus:outline-none focus:border-accent-primary/40 placeholder:text-stone-400 transition-all uppercase"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar items-center">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`flex-shrink-0 px-2 py-1 text-[8px] font-bold rounded transition-all uppercase border ${
                    selectedTag === tag
                      ? 'bg-accent-primary/12 text-accent-primary border-accent-primary/35'
                      : 'bg-white/70 text-stone-500 border-stone-200 hover:text-stone-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 font-mono text-[10px] font-bold text-stone-500">
            <Activity className="w-6 h-6 mb-3 animate-pulse opacity-30" />
            <span className="tracking-[0.3em] animate-pulse uppercase">SYNC_BUFFER...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-stone-200 bg-white/55 rounded">
            <p className="text-stone-500 font-bold text-[9px] uppercase tracking-widest">DATA_EMPTY</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPosts.map((post, idx) => {
              const thumbnail = post.images?.[0] || post.coverImage || null;
              const hasMultiple = (post.images?.length ?? 0) > 1;
              const displayDate = post.updatedAt && post.updatedAt !== post.createdAt
                ? new Date(post.updatedAt)
                : new Date(post.createdAt);
              
              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedSlug(post.slug)}
                  className="group cursor-pointer bg-white/72 border border-stone-200 relative overflow-hidden transition-all duration-300 hover:border-stone-300 hover:shadow-[0_14px_30px_rgba(106,80,58,0.12)]"
                >
                  <div className="absolute top-1.5 right-1.5 text-[6px] font-bold text-stone-400 z-20">
                    ID_{idx.toString().padStart(3, '0')}
                  </div>

                  <div className="relative aspect-square overflow-hidden border-b border-stone-200 bg-[#efe3d4]/50">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover transition-all duration-500 opacity-90 group-hover:opacity-100 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/40">
                        <Database size={24} className="text-stone-300" />
                      </div>
                    )}

                    {hasMultiple && (
                      <div className="absolute top-2 left-2 z-10 opacity-60 group-hover:opacity-90">
                        <Layers size={12} className="text-stone-700" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2 bg-[#f7efe5]/72">
                    <div className="flex justify-between items-center opacity-40">
                        <span className="text-[7px] font-bold text-stone-500 tracking-tighter uppercase">
                            {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex gap-2 text-[7px] font-bold">
                            <span className="flex items-center gap-1"><Heart size={8} /> {post.likesCount}</span>
                        </div>
                    </div>
                    <h3 className="text-[10px] font-bold text-stone-800 uppercase tracking-tight leading-tight line-clamp-1 group-hover:text-accent-primary transition-colors">
                        {post.title}
                    </h3>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPosts.map((post, idx) => {
              const thumbnail = post.images?.[0] || post.coverImage || null;
              const displayDate = post.updatedAt && post.updatedAt !== post.createdAt
                ? new Date(post.updatedAt)
                : new Date(post.createdAt);
              
              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedSlug(post.slug)}
                  className="flex items-center gap-4 cursor-pointer bg-white/70 hover:bg-white/90 border border-stone-200 hover:border-stone-300 p-2.5 transition-all group relative"
                >
                  <div className="relative w-16 h-16 rounded border border-stone-200 overflow-hidden flex-shrink-0 bg-white/50">
                    {thumbnail ? (
                      <img src={thumbnail} alt={post.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/30">
                        <Cpu size={18} className="text-stone-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[7px] font-bold text-stone-500 uppercase tracking-widest">#{idx.toString().padStart(3, '0')}</span>
                        <div className="h-[1px] flex-1 bg-stone-200"></div>
                        <span className="text-[7px] font-bold text-stone-500 uppercase">
                           {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <h3 className="text-[11px] font-bold text-stone-800 uppercase tracking-tight truncate group-hover:text-accent-primary transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-4 mt-1 opacity-60 text-[7px] font-bold uppercase text-stone-600">
                        <span className="flex items-center gap-1"><Heart size={8} /> {post.likesCount}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={8} /> {post.commentsCount}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

        <footer className="max-w-[900px] mx-auto px-4 py-8 border-t border-stone-200 flex justify-between items-center text-stone-500 text-[7px] font-bold tracking-[0.2em] uppercase">
          <div>ARCHIVE_CLUSTER // 0x25</div>
          <div className="flex gap-4">
             <span>Protocol: 0x443</span>
             <span>Status: Online</span>
          </div>
      </footer>

      {selectedSlug && (
        <BlogModal
          slug={selectedSlug}
          isOpen={!!selectedSlug}
          onClose={() => setSelectedSlug(null)}
        />
      )}
    </div>
  );
}
