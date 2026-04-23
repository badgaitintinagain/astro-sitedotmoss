"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  authorName: string;
  tags: string[];
  createdAt: string;
}

export default function BlogPostPage({ slug }: { slug?: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
        fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog/posts/by-slug?slug=${encodeURIComponent(slug!)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.post) {
            setPost(data.post);
        } else {
            setError(true);
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-40 font-mono text-[11px] font-bold text-stone-600">
            <div className="animate-pulse">DECRYPTING_NODE_DATA...</div>
        </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-40 text-center border border-dashed border-stone-300 bg-white/70">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <h2 className="font-mono text-xs font-semibold mb-4 text-stone-700">FATAL_ERROR: NODE_NOT_FOUND</h2>
        <button onClick={() => window.location.href = '/blog'} className="border border-stone-300 px-4 py-2 font-mono text-xs font-bold hover:bg-stone-800 hover:text-white transition-all">
                [ RETURN_TO_LIST ]
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 font-mono text-stone-800 md:pl-2">
        <header className="mb-12">
        <button onClick={() => window.location.href = '/blog'} className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-800 transition-opacity mb-8 border-b border-stone-300 pb-1">
                <ArrowLeft className="w-3 h-3" /> [ BACK_TO_LOG ]
            </button>
            
            <div className="flex items-center gap-3 font-mono text-xs font-bold text-stone-500 mb-4">
                <span>ID.{post.id.substring(0,8).toUpperCase()}</span>
          <span className="w-1 h-1 bg-stone-700"></span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-8 leading-none border-l-8 border-[#cfb59a] pl-6 text-stone-900">{post.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(t => (
            <span key={t} className="bg-[#f3e6d8] text-stone-800 border border-[#e4cfb7] px-3 py-1 text-xs font-bold tracking-wider">{t}</span>
                ))}
            </div>
            
            {post.coverImage && (
          <div className="border border-stone-300 p-1 bg-white/75 mb-12">
            <img src={post.coverImage} className="w-full h-auto contrast-110" alt="" />
                </div>
            )}
        </header>

      <article className="prose prose-sm max-w-none prose-p:font-mono prose-p:text-sm prose-p:leading-relaxed prose-p:text-stone-700 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-stone-900 prose-strong:text-stone-900 prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline prose-img:border prose-img:border-stone-300 prose-img:p-1 prose-code:bg-[#f3e9dc] prose-code:px-1 prose-li:text-stone-700 prose-blockquote:border-[#cfb59a] prose-blockquote:text-stone-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {post.content}
            </ReactMarkdown>
        </article>
        
      <footer className="mt-20 pt-12 border-t border-stone-200 mb-20 text-center">
             <p className="font-mono text-xs font-bold opacity-30">End_of_Transmission // Site.Moss Core</p>
        </footer>
    </div>
  );
}
