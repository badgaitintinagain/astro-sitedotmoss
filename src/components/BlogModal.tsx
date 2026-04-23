"use client";
import React, { useState, useEffect } from 'react';
import { X, Heart, Send, Trash2, MessageCircle, CornerDownRight, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  images: string[];
  authorName: string;
  tags: string[];
  createdAt: Date;
}

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
  status: string;
  parentId?: string | null;
}

interface BlogModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogModal({ slug, isOpen, onClose }: BlogModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    // Generate or retrieve user ID
    let uid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!uid) {
      uid = crypto.randomUUID();
      if (typeof window !== 'undefined') localStorage.setItem('userId', uid);
    }
    setUserId(uid);

    // Check if admin
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isOpen && slug) {
      setImageIndex(0);
      fetchPost();
      fetchComments();
    }
  }, [isOpen, slug, userId]);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setIsAdmin(data.user?.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/by-slug?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
        // Fetch likes after we have the post
        if (data.post?.id) {
          const likesResponse = await fetch(`/api/blog/posts/${data.post.id}/like?userId=${userId}`);
          if (likesResponse.ok) {
            const likesData = await likesResponse.json();
            setLikesCount(likesData.likesCount);
            setIsLiked(likesData.isLiked);
          }
        }
      }
    } catch {
      console.error('Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/comments/by-post?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch {
      console.error('Failed to fetch comments');
    }
  };

  const handleLike = async () => {
    if (!post?.id) return;
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/blog/posts/${post.id}/like`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likesCount);
        setIsLiked(data.isLiked);
      }
    } catch {
      console.error('Failed to like post');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postSlug: slug,
          name: commentForm.name,
          content: commentForm.content,
          parentId: replyingTo,
        }),
      });

      if (response.ok) {
        setCommentForm({ name: '', content: '' });
        setReplyingTo(null);
        fetchComments();
      }
    } catch {
      console.error('Failed to comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('ต้องการลบคอมเมนท์นี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/blog/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch {
      console.error('Failed to delete comment');
    }
  };

  const getReplies = (parentId: string) => {
    return comments.filter(c => c.parentId === parentId);
  };

  const topLevelComments = comments.filter(c => !c.parentId);

  const allImages = post
    ? post.images?.length
      ? post.images
      : post.coverImage
        ? [post.coverImage]
        : []
    : [];

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-white font-mono">LOADING_CONTENT...</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 animate-in fade-in zoom-in duration-200">
      <div className="relative w-full max-w-6xl h-[95vh] md:h-[90vh] bg-[#1a1c18] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors border border-white/10"
        >
          <X size={18} />
        </button>

        {/* Left: Image Carousel */}
        {allImages.length > 0 && (
          <div className="md:w-3/5 bg-black/40 flex items-center justify-center relative flex-shrink-0 h-56 md:h-auto border-r border-white/5">
            <img
              src={allImages[imageIndex]}
              alt={post.title}
              className="w-full h-full object-contain"
            />

            {imageIndex > 0 && (
              <button
                onClick={() => setImageIndex(i => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10 border border-white/10"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {imageIndex < allImages.length - 1 && (
              <button
                onClick={() => setImageIndex(i => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors z-10 border border-white/10"
              >
                <ChevronRight size={18} />
              </button>
            )}

            {allImages.length > 1 && (
              <>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === imageIndex ? 'bg-white scale-125' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute top-3 right-3 z-10 text-white/40">
                  <Layers size={20} />
                </div>
                <div className="absolute top-3 left-3 z-10 bg-black/50 text-white/80 font-mono text-[10px] px-2 py-1 rounded border border-white/10">
                  IMG.{imageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Right: Content & Comments */}
        <div className={`${allImages.length > 0 ? 'md:w-2/5' : 'w-full'} flex flex-col bg-[#1a1c18] min-h-0`}>
          {/* Header */}
          <div className="border-b border-white/10 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 border border-accent-primary/30">
                <span className="text-accent-primary font-bold text-sm">
                  {post.authorName[0]}
                </span>
              </div>
              <div>
                <p className="font-bold text-white text-sm tracking-tight">{post.authorName}</p>
                <p className="text-[10px] font-mono text-stone-500 uppercase">
                  {new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Content & Comments - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar">
            {/* Post Title & Content */}
            <div className="space-y-3">
              <h1 className="text-lg font-bold text-white leading-snug tracking-tight uppercase">{post.title}</h1>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono text-accent-primary uppercase border border-accent-primary/20 px-1.5 bg-accent-primary/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="prose prose-sm prose-invert max-w-none 
                prose-p:text-stone-300 prose-p:leading-relaxed
                prose-headings:text-white prose-headings:uppercase prose-headings:tracking-tighter
                prose-a:text-accent-primary prose-strong:text-white
                prose-img:rounded-lg prose-img:border prose-img:border-white/10">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="font-mono text-[11px] font-bold text-stone-400 flex items-center gap-2 uppercase">
                <MessageCircle size={14} />
                COMMENTS // {comments.length}
              </h3>
              
              {topLevelComments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0 border border-white/5">
                      <span className="text-[11px] text-stone-400 font-bold">
                        {comment.authorName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-bold text-stone-200 text-xs">{comment.authorName}</p>
                        <span className="text-[9px] font-mono text-stone-600">
                          {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="ml-auto text-red-500/50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">{comment.content}</p>
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-[9px] font-mono font-bold text-stone-600 hover:text-accent-primary transition-colors mt-1.5 flex items-center gap-1 uppercase"
                      >
                        <CornerDownRight size={10} />
                        REPLY
                      </button>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {getReplies(comment.id).map((reply) => (
                    <div key={reply.id} className="ml-9 flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0 border border-white/5">
                        <span className="text-[9px] text-stone-600 font-bold">
                          {reply.authorName[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-bold text-stone-300 text-[11px]">{reply.authorName}</p>
                          <span className="text-[9px] font-mono text-stone-600">
                            {new Date(reply.createdAt).toLocaleDateString('th-TH')}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteComment(reply.id)}
                              className="ml-auto text-red-500/50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {topLevelComments.length === 0 && (
                <div className="text-center py-6 border border-dashed border-white/5 rounded-lg">
                  <p className="text-[10px] font-mono text-stone-600 uppercase">NO_RECORDS_FOUND // BE_THE_FIRST</p>
                </div>
              )}
            </div>
          </div>

          {/* Like & Comment Form */}
          <div className="border-t border-white/10 p-4 space-y-3 bg-[#1a1c18] flex-shrink-0">
            {/* Like Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-all active:scale-90 ${
                  isLiked ? 'text-red-500' : 'text-stone-500 hover:text-red-500'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <span className="text-[11px] font-mono font-bold text-stone-400 uppercase">
                {likesCount} {likesCount === 1 ? 'REACTION' : 'REACTIONS'}
              </span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-2">
              {replyingTo && (
                <div className="flex items-center justify-between bg-accent-primary/5 border border-accent-primary/20 px-3 py-1.5 rounded text-[10px] font-mono">
                  <span className="text-accent-primary font-bold uppercase">REPLY_MODE: ACTIVE</span>
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-stone-500 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              )}
              <input
                type="text"
                required
                placeholder="IDENTIFIER (NAME)"
                value={commentForm.name}
                onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-3 text-[11px] font-mono text-white focus:outline-none focus:border-accent-primary/40 transition-colors placeholder:text-stone-700"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="ADD_COMMENT_DATA..."
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  className="flex-1 bg-black/20 border border-white/10 rounded-md py-1.5 px-3 text-[11px] font-mono text-white focus:outline-none focus:border-accent-primary/40 transition-colors placeholder:text-stone-700"
                />
                <button
                  type="submit"
                  disabled={submitting || !commentForm.name || !commentForm.content}
                  className="px-3 py-1.5 bg-accent-primary/10 hover:bg-accent-primary/20 disabled:opacity-20 text-accent-primary rounded-md border border-accent-primary/30 transition-all active:scale-95"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
