"use client";
import React from 'react';
import Tile from './Tile';
import { FileText } from 'lucide-react';

interface BlogTileProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
}

const BlogTile: React.FC<BlogTileProps> = ({ size = '2x2', accent = 'primary', opacity = 40 }) => {
  return (
    <Tile 
      size={size} 
      label="Blog Cluster" 
      icon={FileText} 
      accentType={accent}
      opacity={opacity}
      onClick={() => window.location.href = '/blog'}
    />
  );
};

export default BlogTile;
