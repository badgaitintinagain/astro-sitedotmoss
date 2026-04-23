// Add this file to improve React components performance
import dynamic from 'next/dynamic';

// Lazy load heavy components
export const LazyBlogTile = dynamic(() => import('@/components/BlogTile'), {
  ssr: false
});

export const LazyMicronversationTile = dynamic(() => import('@/components/MicronversationTile'), {
  ssr: false
});

// Pre-load critical components
export { default as Tile } from '@/components/Tile';
export { default as ClockTile } from '@/components/ClockTile';
export { default as WeatherTile } from '@/components/WeatherTile';
export { default as CalendarTile } from '@/components/CalendarTile';
export { default as BlogModal } from '@/components/BlogModal';
export { default as ResourceTile } from '@/components/ResourceTile';
export { default as SpotifyAnalysisTile } from '@/components/SpotifyAnalysisTile';
