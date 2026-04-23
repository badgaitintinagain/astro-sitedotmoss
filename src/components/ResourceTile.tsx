"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Tile from './Tile';
import { FolderOpen, X, Upload, Trash2, Download, Loader2, Search, Plus } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  uploadedBy: string;
  createdAt: string;
}

interface ResourceTileProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
}

const ResourceTile: React.FC<ResourceTileProps> = ({ size = '1x1', accent = 'primary', opacity = 25 }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      console.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchResources();
      checkAdmin();
    }
  }, [isOpen, fetchResources]);

  // Generate upload preview
  useEffect(() => {
    if (!uploadFile) { setUploadPreviewUrl(null); return; }
    const url = URL.createObjectURL(uploadFile);
    setUploadPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadFile]);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setIsAdmin(data.user?.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  };

  // Filter resources by search query (title, description, category)
  const filteredResources = resources.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.description?.toLowerCase().includes(q)) ||
      (r.category?.toLowerCase().includes(q))
    );
  });

  // Get unique categories from existing resources
  const categories = Array.from(new Set(resources.map(r => r.category).filter(Boolean) as string[]));

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      if (uploadDesc.trim()) formData.append('description', uploadDesc.trim());
      if (uploadCategory.trim()) formData.append('category', uploadCategory.trim());

      const res = await fetch('/api/resources', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');

      // Reset form & refresh
      setUploadTitle('');
      setUploadDesc('');
      setUploadCategory('');
      setUploadFile(null);
      setShowUploadForm(false);
      fetchResources();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      const res = await fetch(`/api/resources/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setResources(prev => prev.filter(r => r.id !== id));
        if (preview?.id === id) setPreview(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSave = async (resource: Resource) => {
    try {
      const response = await fetch(resource.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.${blob.type.split('/')[1] || 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(resource.imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setPreview(null);
    setShowUploadForm(false);
    setSearchQuery('');
  };

  return (
    <>
      <Tile
        size={size}
        label="Resources"
        icon={FolderOpen}
        accentType={accent}
        opacity={opacity}
        onClick={() => setIsOpen(true)}
      />

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 md:p-8" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            ref={modalRef}
            className="relative w-full sm:max-w-4xl h-[95dvh] sm:h-[80vh] bg-background border-t sm:border border-foreground/10  sm: overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden w-10 h-1 bg-foreground/20  mx-auto mt-2 mb-1 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-foreground/10 flex-shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">Resources</h2>
                <p className="text-xs uppercase tracking-wide opacity-40 text-foreground">Save & use in AI Lab</p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className={`p-2  border transition-colors ${
                      showUploadForm
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-foreground/5 border-foreground/10 hover:bg-foreground/10 text-foreground'
                    }`}
                  >
                    <Plus size={16} />
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="p-2  bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Admin Upload Form */}
            {isAdmin && showUploadForm && (
              <form onSubmit={handleUpload} className="px-4 sm:px-6 py-3 sm:py-4 border-b border-foreground/10 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Image Drop Area */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-full h-24 sm:w-28 sm:h-28  border-2 border-dashed border-foreground/20 hover:border-foreground/40 transition-colors overflow-hidden flex items-center justify-center bg-foreground/5"
                  >
                    {uploadPreviewUrl ? (
                      <Image src={uploadPreviewUrl} alt="Preview" width={112} height={112} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center sm:flex-col gap-2 sm:gap-1 text-foreground/30">
                        <Upload size={20} />
                        <span className="text-xs sm:text-[8px] uppercase tracking-wide font-bold">Choose Image</span>
                      </div>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {/* Fields */}
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm  bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground/30"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                      className="w-full px-3 py-2 text-sm  bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground/30"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Category"
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm  bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground/30"
                        list="category-suggestions"
                      />
                      <datalist id="category-suggestions">
                        {categories.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                      <button
                        type="submit"
                        disabled={uploading || !uploadFile || !uploadTitle.trim()}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider  bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-30 whitespace-nowrap"
                      >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Search + Category Chips */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-foreground/10 flex-shrink-0 flex flex-col gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm  bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground/30"
                />
              </div>
              {categories.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSearchQuery(prev => prev === cat ? '' : cat)}
                      className={`px-2.5 py-0.5 text-xs uppercase tracking-wide font-bold  border transition-colors whitespace-nowrap ${
                        searchQuery === cat
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-transparent text-foreground/50 border-foreground/10 hover:border-foreground/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin opacity-30 text-foreground" />
                </div>
              ) : preview ? (
                /* Preview Mode */
                <div className="flex flex-col items-center gap-4 sm:gap-5">
                  <button
                    onClick={() => setPreview(null)}
                    className="self-start text-xs uppercase tracking-wide font-bold text-foreground/40 hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="relative w-full max-w-xs sm:max-w-md aspect-square  overflow-hidden border border-foreground/10 flex-shrink-0">
                    <Image
                      src={preview.imageUrl}
                      alt={preview.title}
                      fill
                      className="object-contain bg-foreground/5"
                      sizes="(max-width: 640px) 90vw, 448px"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-foreground text-base sm:text-lg">{preview.title}</h3>
                    {preview.description && (
                      <p className="text-xs sm:text-sm text-foreground/50 mt-1">{preview.description}</p>
                    )}
                    {preview.category && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 text-xs uppercase tracking-wide font-bold  border border-foreground/10 text-foreground/40">
                        {preview.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 pb-4">
                    <button
                      onClick={() => handleSave(preview)}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider  bg-foreground text-background hover:opacity-80 transition-opacity"
                    >
                      <Download size={14} /> Save
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(preview.id)}
                        className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider  border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <FolderOpen size={40} className="mb-3 text-foreground/15" />
                  <p className="text-sm text-foreground/30">
                    {searchQuery ? 'No matching resources' : 'No resources yet'}
                  </p>
                </div>
              ) : (
                /* Grid View — fixed square thumbnails */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {filteredResources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => setPreview(resource)}
                      className="group relative aspect-square  overflow-hidden border border-foreground/10 hover:border-foreground/30 transition-all hover:shadow-lg bg-foreground/5"
                    >
                      <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                      <span className="absolute bottom-1.5 left-2 right-2 text-xs font-bold text-white uppercase tracking-wider sm:opacity-0 sm:group-hover:opacity-100 transition-opacity truncate drop-shadow-sm">
                        {resource.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceTile;
