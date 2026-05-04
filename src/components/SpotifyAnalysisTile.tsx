"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Tile from './Tile';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Disc3, MapPinned, Radar, Sparkles, X } from 'lucide-react';
import clusterSummaryData from '../../data/cluster_summary.json';
import divaDnaData from '../../data/diva_dna.json';
import musicGalaxyData from '../../data/music_galaxy.json';
import mdnaTourImage from '../assets/image/MDNATour-1.jpg';
import discoDynamoImage from '../assets/image/thediscodynamo-1.jpg';
import discoDynamoImage2 from '../assets/image/thediscodynamo-2.png';
import discoDynamoImage3 from '../assets/image/thediscodynamo-3.jpg';

interface ClusterData {
  cluster: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  loudness: number;
  description: string;
  count: number;
  popularity: number;
}

interface TrackData {
  name: string;
  artists: string;
  release_year: number;
  cluster: number;
  tsne_x: number;
  tsne_y: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  speechiness: number;
}

interface DivaData {
  artists: string;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  speechiness: number;
}

interface SimilarTrack {
  index: number;
  similarity: number;
}

interface EraProfile {
  label: string;
  years: string;
  count: number;
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  speechiness: number;
}

interface SpotifyAnalysisTileProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
  isFullPage?: boolean;
}

type TrackIdentity = Pick<TrackData, 'name' | 'release_year'>;

const CLUSTER_NAMES: Record<number, { name: string; description: string; color: string }> = {
  0: { name: 'Energetic and Danceable', description: 'High energy, upbeat tracks with strong danceability', color: '#FF4D8D' },
  1: { name: 'Acoustic and Mellow', description: 'Warm, acoustic-rich songs with emotional depth', color: '#22C55E' },
  2: { name: 'Bold and Uplifting', description: 'Adventurous, experimental, and uplifting tracks', color: '#FACC15' },
  3: { name: 'Smooth and Sophisticated', description: 'Refined, polished tracks with strong presence', color: '#38BDF8' }
};

const TAB_META = {
  personas: {
    title: 'Sonic Personas',
    icon: Sparkles,
    blurb: 'AI groups tracks by feel, not by release year.'
  },
  galaxy: {
    title: 'Music Galaxy',
    icon: MapPinned,
    blurb: 't-SNE turns five audio dimensions into a 2D star map.'
  },
  comparison: {
    title: 'Diva DNA',
    icon: Radar,
    blurb: 'Compare Madonna with other pop icons through shared audio traits.'
  }
} as const;

const AUDIO_FEATURE_KEYS: Array<keyof TrackData> = [
  'danceability',
  'energy',
  'valence',
  'acousticness',
  'speechiness'
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const DISCO_DYNAMO_IMAGES = [discoDynamoImage, discoDynamoImage2, discoDynamoImage3] as const;

const getTrackKey = (track: TrackIdentity) => `${track.name}::${track.release_year}`;

const projectTsnePoint = (
  value: number,
  min: number,
  max: number,
  size: number,
  padding = 36
) => {
  if (max === min) return size / 2;
  const normalized = (value - min) / (max - min);
  return padding + normalized * (size - padding * 2);
};

class TrackFeatureSpace {
  private readonly similarityMatrix: number[][];

  constructor(private readonly tracks: TrackData[]) {
    const vectors = tracks.map(track => AUDIO_FEATURE_KEYS.map(key => Number(track[key])));
    const norms = vectors.map(vector => Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)));
    const size = tracks.length;

    this.similarityMatrix = Array.from({ length: size }, (_, rowIndex) =>
      Array.from({ length: size }, (_, columnIndex) => (rowIndex === columnIndex ? 1 : 0))
    );

    for (let row = 0; row < size; row += 1) {
      for (let column = row + 1; column < size; column += 1) {
        const rowNorm = norms[row];
        const columnNorm = norms[column];
        if (rowNorm === 0 || columnNorm === 0) {
          this.similarityMatrix[row][column] = 0;
          this.similarityMatrix[column][row] = 0;
          continue;
        }

        let dot = 0;
        const rowVector = vectors[row];
        const columnVector = vectors[column];
        for (let index = 0; index < rowVector.length; index += 1) {
          dot += rowVector[index] * columnVector[index];
        }

        const similarity = dot / (rowNorm * columnNorm);
        this.similarityMatrix[row][column] = similarity;
        this.similarityMatrix[column][row] = similarity;
      }
    }
  }

  getCentralityScores() {
    const size = this.similarityMatrix.length;
    if (size <= 1) return Array.from({ length: size }, () => 0);

    return this.similarityMatrix.map((row, rowIndex) => {
      const sum = row.reduce((total, value) => total + value, 0) - row[rowIndex];
      return sum / (size - 1);
    });
  }

  getTopSimilarTracks(trackIndex: number, limit: number) {
    const row = this.similarityMatrix[trackIndex];
    if (!row) return [];

    return row
      .map((similarity, index) => ({ index, similarity }))
      .filter(item => item.index !== trackIndex)
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, limit);
  }
}

const SpotifyAnalysisTile: React.FC<SpotifyAnalysisTileProps> = ({
  size = '2x1',
  accent = 'primary',
  opacity = 50,
  isFullPage = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personas' | 'galaxy' | 'comparison'>('personas');
  const [selectedCluster, setSelectedCluster] = useState(0);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [selectedEraIndex, setSelectedEraIndex] = useState(0);
  const [discoImageIndex, setDiscoImageIndex] = useState(() => Math.floor(Math.random() * DISCO_DYNAMO_IMAGES.length));

  const clusters = clusterSummaryData as ClusterData[];
  const tracks = useMemo(
    () => (musicGalaxyData as TrackData[]).filter(track => track.release_year <= 2020),
    []
  );
  const divas = divaDnaData as DivaData[];
  const trackFeatureSpace = useMemo(() => new TrackFeatureSpace(tracks), [tracks]);
  const trackIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    tracks.forEach((track, index) => {
      map.set(getTrackKey(track), index);
    });
    return map;
  }, [tracks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDiscoImageIndex(previous => {
        if (DISCO_DYNAMO_IMAGES.length <= 1) return previous;
        let next = previous;
        while (next === previous) {
          next = Math.floor(Math.random() * DISCO_DYNAMO_IMAGES.length);
        }
        return next;
      });
    }, 70_000);

    return () => clearInterval(interval);
  }, []);

  const madonnaTracks = useMemo(() => tracks.filter(track => String(track.artists).includes('Madonna')), [tracks]);
  const selectedTrack = tracks[selectedTrackIndex] ?? tracks[0];
  const selectedClusterMeta = CLUSTER_NAMES[selectedCluster];
  const tsneBounds = useMemo(() => {
    const xValues = tracks.map(track => track.tsne_x);
    const yValues = tracks.map(track => track.tsne_y);

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues)
    };
  }, [tracks]);
  const clusterTrackCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    tracks.forEach(track => {
      counts[track.cluster] = (counts[track.cluster] ?? 0) + 1;
    });
    return counts;
  }, [tracks]);

  const popularityProxyByTrackIndex = useMemo(() => {
    const centrality = trackFeatureSpace.getCentralityScores();

    const min = Math.min(...centrality);
    const max = Math.max(...centrality);
    if (max === min) return centrality.map(() => 0.5);

    return centrality.map(value => clamp((value - min) / (max - min), 0, 1));
  }, [trackFeatureSpace]);

  const weightedClusterImpact = useMemo(() => {
    const map: Record<number, { weightedSum: number; share: number; meanWeight: number }> = {
      0: { weightedSum: 0, share: 0, meanWeight: 0 },
      1: { weightedSum: 0, share: 0, meanWeight: 0 },
      2: { weightedSum: 0, share: 0, meanWeight: 0 },
      3: { weightedSum: 0, share: 0, meanWeight: 0 }
    };
    const countMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

    tracks.forEach((track, index) => {
      const weight = popularityProxyByTrackIndex[index] * 0.85 + 0.15;
      map[track.cluster] = {
        ...map[track.cluster],
        weightedSum: map[track.cluster].weightedSum + weight,
        meanWeight: map[track.cluster].meanWeight + weight
      };
      countMap[track.cluster] = (countMap[track.cluster] ?? 0) + 1;
    });

    const total = Object.values(map).reduce((sum, entry) => sum + entry.weightedSum, 0) || 1;

    Object.keys(map).forEach(clusterKey => {
      const cluster = Number(clusterKey);
      map[cluster].share = map[cluster].weightedSum / total;
      map[cluster].meanWeight = countMap[cluster] > 0 ? map[cluster].meanWeight / countMap[cluster] : 0;
    });

    return map;
  }, [tracks, popularityProxyByTrackIndex]);

  const selectedClusterTracks = useMemo(
    () => {
      const allTracks = tracks.filter(track => track.cluster === selectedCluster);
      
      // Deduplicate by track name, keep only first occurrence
      const seen = new Set<string>();
      const uniqueTracks: TrackData[] = [];
      
      for (const track of allTracks) {
        if (!seen.has(track.name)) {
          seen.add(track.name);
          uniqueTracks.push(track);
        }
      }
      
      // Sort by release year descending (newest first), then by name
      return uniqueTracks.sort((left, right) => {
        if (right.release_year !== left.release_year) {
          return right.release_year - left.release_year;
        }
        return left.name.localeCompare(right.name);
      });
    },
    [tracks, selectedCluster]
  );

  const wormholeLinks = useMemo<SimilarTrack[]>(() => {
    if (!selectedTrack) return [];

    const allLinks = trackFeatureSpace.getTopSimilarTracks(selectedTrackIndex, 20);
    
    // Filter out: duplicates by track name, selected track itself, and low similarity scores
    const seen = new Set<string>();
    const filtered = allLinks.filter(link => {
      const track = tracks[link.index];
      if (!track) return false;
      
      const trackKey = `${track.name}::${track.release_year}`;
      const isSelected = track.name === selectedTrack.name && track.release_year === selectedTrack.release_year;
      const isDuplicate = seen.has(trackKey);
      
      if (!isDuplicate && !isSelected) {
        seen.add(trackKey);
        return true;
      }
      return false;
    });

    return filtered.slice(0, 5);
  }, [selectedTrack, selectedTrackIndex, trackFeatureSpace, tracks]);

  const eraProfiles = useMemo<EraProfile[]>(() => {
    const buckets = [
      { label: '80s', min: 1980, max: 1989 },
      { label: '90s', min: 1990, max: 1999 },
      { label: '00s', min: 2000, max: 2009 },
      { label: '10s+', min: 2010, max: 2030 }
    ];

    return buckets
      .map(bucket => {
        const bucketTracks = madonnaTracks.filter(track => track.release_year >= bucket.min && track.release_year <= bucket.max);
        if (!bucketTracks.length) return null;

        const aggregate = bucketTracks.reduce(
          (accumulator, track) => {
            accumulator.danceability += track.danceability;
            accumulator.energy += track.energy;
            accumulator.valence += track.valence;
            accumulator.acousticness += track.acousticness;
            accumulator.speechiness += track.speechiness;
            return accumulator;
          },
          { danceability: 0, energy: 0, valence: 0, acousticness: 0, speechiness: 0 }
        );

        const count = bucketTracks.length;
        return {
          label: bucket.label,
          years: `${bucket.min}-${bucket.max}`,
          count,
          danceability: aggregate.danceability / count,
          energy: aggregate.energy / count,
          valence: aggregate.valence / count,
          acousticness: aggregate.acousticness / count,
          speechiness: aggregate.speechiness / count
        };
      })
      .filter((profile): profile is EraProfile => Boolean(profile));
  }, [madonnaTracks]);

  const safeSelectedEraIndex = clamp(selectedEraIndex, 0, Math.max(eraProfiles.length - 1, 0));
  const selectedEra = eraProfiles[safeSelectedEraIndex] ?? eraProfiles[0];

  const diva = useMemo(() => divas.find(item => item.artists === 'Madonna') ?? divas[0], [divas]);
  const closestDivaNeighbors = useMemo(
    () => divas
      .filter(item => item.artists !== 'Madonna')
      .sort((left, right) => Math.abs(left.energy - (diva?.energy ?? 0)) - Math.abs(right.energy - (diva?.energy ?? 0)))
      .slice(0, 6),
    [diva, divas]
  );

  const handleClusterSelect = useCallback((cluster: number) => {
    setSelectedCluster(cluster);
    const dominantTrackIndex = tracks.findIndex(track => track.cluster === cluster);
    if (dominantTrackIndex >= 0) {
      setSelectedTrackIndex(dominantTrackIndex);
    }
  }, [tracks]);

  const analysisContent = (
    <>
      <div className="border-b border-stone-300/70 px-4 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-700">
              <Sparkles className="h-3 w-3" /> Madonna Sonic Atlas
            </div>
            <p className="mt-1 text-xs text-stone-600">Tracks {tracks.length} • Clusters {clusters.length} • Madonna {madonnaTracks.length}</p>
          </div>

          {!isFullPage && (
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-stone-300/80 bg-white/80 p-2 text-stone-700 transition-all duration-200 hover:bg-white hover:text-stone-900"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
        <div className="flex h-full gap-2">
          <aside className="w-[168px] shrink-0 overflow-y-auto rounded-[14px] border border-stone-300/70 bg-white/72 p-2.5">
            <p className="px-1 text-[10px] uppercase tracking-[0.2em] text-stone-600">Menu</p>
            <div className="mt-2 space-y-1.5">
              {(['personas', 'galaxy', 'comparison'] as const).map(tab => {
                const meta = TAB_META[tab];
                const Icon = meta.icon;
                const active = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex w-full items-center gap-2 rounded-[10px] border px-2.5 py-2 text-left text-xs transition-colors ${active ? 'border-stone-300/90 bg-white text-stone-900' : 'border-stone-300/70 bg-white/80 text-stone-700 hover:bg-white hover:text-stone-900'}`}
                    title={meta.blurb}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="truncate">{meta.title}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 flex-1 overflow-hidden">
        {activeTab === 'personas' && (
          <section className="grid h-full gap-2 grid-rows-[auto_1fr_auto] grid-cols-[1fr_2fr_280px]">
            {/* Cluster Rail - Top Left */}
            <div className="col-span-1 row-span-1 rounded-[14px] border border-stone-300/70 bg-white/72 p-3">
              <div className="flex items-center gap-2 text-stone-700 mb-2">
                <Disc3 className="h-4 w-4" />
                <p className="text-xs font-semibold">Sonic Personas</p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {clusters.map(cluster => {
                  const meta = CLUSTER_NAMES[cluster.cluster];
                  const active = selectedCluster === cluster.cluster;
                  const trackCount = clusterTrackCounts[cluster.cluster] ?? 0;
                  return (
                    <button
                      key={cluster.cluster}
                      onClick={() => handleClusterSelect(cluster.cluster)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium border transition-all ${active ? 'border-stone-300/90 bg-white text-stone-900' : 'border-stone-300/70 bg-white/80 text-stone-700 hover:bg-white'}`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span>{trackCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Card - Center Large */}
            <div className="col-span-1 row-span-2 rounded-[14px] border border-stone-300/70 bg-white/72 p-4 relative overflow-hidden">
              {selectedCluster === 0 && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
                    style={{ backgroundImage: `url(${DISCO_DYNAMO_IMAGES[discoImageIndex].src})` }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/35" />
                </>
              )}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: `${selectedClusterMeta.color}45` }} />
              
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedClusterMeta.color }} />
                    <h2 className="text-2xl font-bold text-stone-900">{selectedClusterMeta.name}</h2>
                  </div>
                  <p className="text-sm text-stone-700 mb-4 leading-relaxed">{selectedClusterMeta.description}</p>

                  <div className="inline-flex items-center gap-2 mb-6 bg-white/85 rounded-full px-3 py-1">
                    <span className="text-xs text-stone-700">Impact</span>
                    <span className="text-sm font-bold text-stone-900">{Math.round((weightedClusterImpact[selectedCluster]?.share ?? 0) * 100)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Danceability', value: clusters[selectedCluster]?.danceability ?? 0 },
                      { label: 'Energy', value: clusters[selectedCluster]?.energy ?? 0 },
                      { label: 'Valence', value: clusters[selectedCluster]?.valence ?? 0 },
                      { label: 'Acousticness', value: clusters[selectedCluster]?.acousticness ?? 0 }
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="text-stone-700 font-medium">{metric.label}</span>
                          <span className="text-stone-900 font-bold">{Math.round(metric.value * 100)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-stone-200/80">
                          <div className="h-full rounded-full transition-all" style={{ width: `${metric.value * 100}%`, backgroundColor: selectedClusterMeta.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-stone-600 italic pt-4 border-t border-stone-300/50">
                  Ranked by sonic similarity network • {clusterTrackCounts[selectedCluster] ?? 0} tracks in cluster
                </p>
              </div>
            </div>

            {/* Top Tracks - Right */}
            <div className="col-span-1 row-span-2 rounded-[14px] border border-stone-300/70 bg-white/72 p-3 flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-semibold mb-3">Top Tracks</p>
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {selectedClusterTracks.slice(0, 8).map(track => (
                  <button
                    key={`${track.name}-${track.release_year}`}
                    onClick={() => {
                      const index = trackIndexByKey.get(getTrackKey(track));
                      if (typeof index === 'number') setSelectedTrackIndex(index);
                    }}
                    className={`flex w-full items-center justify-between rounded-[10px] border px-2.5 py-2 text-left text-xs transition-colors ${selectedTrack?.name === track.name ? 'border-stone-300/90 bg-white text-stone-900 font-semibold' : 'border-stone-300/70 bg-white/80 text-stone-700 hover:bg-white'}`}
                  >
                    <span className="min-w-0 flex-1 truncate pr-2">{track.name}</span>
                    <span className="text-[10px] text-stone-600 shrink-0">{track.release_year}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Info - Spans all columns */}
            <div className="col-span-3 rounded-[14px] border border-stone-300/70 bg-stone-50/60 p-2.5 text-xs text-stone-700">
              <div className="flex items-center justify-between gap-4">
                <p>AI groups tracks by audio feel, not release date • Use similarity network for vibe discovery</p>
                <p className="text-stone-600 text-[10px]">Tracks: {tracks.length} • Madonna: {madonnaTracks.length}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'galaxy' && (
          <section className="grid h-full gap-2 grid-rows-[1fr_auto] grid-cols-[1.5fr_280px]">
            {/* Music Galaxy Chart - Main */}
            <div className="col-span-1 rounded-[14px] border border-stone-300/70 bg-white/72 p-3 flex flex-col">
              <div className="mb-2.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-semibold">2D Manifold</p>
                <h3 className="text-lg font-bold text-stone-900">Music Galaxy</h3>
              </div>

              <div className="flex-1 relative overflow-hidden rounded-[12px] border border-stone-300/70 bg-slate-900/72 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(56,189,248,0.22)_0%,transparent_40%),radial-gradient(circle_at_68%_70%,rgba(251,191,36,0.14)_0%,transparent_38%)]" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="grid-lines" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
                    </pattern>
                    <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <rect width="1000" height="620" fill="url(#grid-lines)" />
                  <circle cx="500" cy="310" r="150" fill="rgba(255,255,255,0.14)" />

                  {selectedTrack && wormholeLinks.map(link => {
                    const selectedX = projectTsnePoint(selectedTrack.tsne_x, tsneBounds.minX, tsneBounds.maxX, 1000);
                    const selectedY = projectTsnePoint(selectedTrack.tsne_y, tsneBounds.minY, tsneBounds.maxY, 620);
                    const targetTrack = tracks[link.index];
                    if (!targetTrack) return null;

                    const targetX = projectTsnePoint(targetTrack.tsne_x, tsneBounds.minX, tsneBounds.maxX, 1000);
                    const targetY = projectTsnePoint(targetTrack.tsne_y, tsneBounds.minY, tsneBounds.maxY, 620);
                    const opacity = clamp((link.similarity - 0.85) / 0.15, 0.2, 0.95);

                    return (
                      <line
                        key={`wormhole-${selectedTrackIndex}-${link.index}`}
                        x1={selectedX}
                        y1={selectedY}
                        x2={targetX}
                        y2={targetY}
                        stroke="rgba(125,211,252,0.9)"
                        strokeWidth={1 + opacity * 2.5}
                        strokeOpacity={opacity}
                        strokeDasharray="3 4"
                      />
                    );
                  })}

                  {tracks.map((track, index) => {
                    const meta = CLUSTER_NAMES[track.cluster];
                    const x = projectTsnePoint(track.tsne_x, tsneBounds.minX, tsneBounds.maxX, 1000);
                    const y = projectTsnePoint(track.tsne_y, tsneBounds.minY, tsneBounds.maxY, 620);
                    const isActive = selectedTrack?.name === track.name && selectedTrack?.release_year === track.release_year;
                    const isDimmed = selectedCluster !== track.cluster;

                    return (
                      <g
                        key={`${track.name}-${index}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setSelectedTrackIndex(index)}
                        onClick={() => setSelectedTrackIndex(index)}
                        style={{ opacity: isDimmed ? 0.7 : 1 }}
                      >
                        <title>{`${track.name} (${track.release_year})`}</title>
                        <circle cx={x} cy={y} r={isActive ? 16 : 10} fill={meta.color} opacity={isActive ? 0.22 : 0.16} filter="url(#pointGlow)" />
                        <circle cx={x} cy={y} r={isActive ? 12 : 7} fill={meta.color} opacity={isActive ? 0.44 : 0.32} />
                        <circle cx={x} cy={y} r={isActive ? 5.5 : 3.8} fill={meta.color} stroke="rgba(255,255,255,0.92)" strokeWidth={isActive ? 1.8 : 1.1} />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-2 rounded-[12px] border border-stone-300/70 bg-white/80 p-2.5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-600 font-semibold mb-2">Cluster Palette</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(CLUSTER_NAMES).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => handleClusterSelect(Number(key))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-300/80 bg-white/90 px-2 py-1 text-[11px] transition-colors hover:bg-white"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="font-medium">{meta.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Info Panel */}
            <div className="col-span-1 row-span-2 flex flex-col gap-2">
              <div className="rounded-[14px] border border-stone-300/70 bg-white/80 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-semibold mb-2">Selected Track</p>
                <h4 className="text-sm font-bold text-stone-900 truncate" title={selectedTrack?.name}>{selectedTrack?.name}</h4>
                <p className="text-[11px] text-stone-600 mb-2">{selectedTrack?.release_year}</p>
                <span className="inline-block rounded-full border border-stone-300/80 bg-stone-100 px-2 py-0.5 text-[10px] text-stone-700 font-semibold">
                  {CLUSTER_NAMES[selectedTrack?.cluster ?? 0]?.name}
                </span>

                <div className="mt-3 space-y-1.5 text-xs">
                  {[
                    { label: 'Dance', value: selectedTrack?.danceability ?? 0 },
                    { label: 'Energy', value: selectedTrack?.energy ?? 0 },
                    { label: 'Valence', value: selectedTrack?.valence ?? 0 },
                    { label: 'Acoustic', value: selectedTrack?.acousticness ?? 0 }
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-stone-700">{metric.label}</span>
                        <span className="text-stone-900 font-bold">{Math.round(metric.value * 100)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200/80">
                        <div className="h-full rounded-full bg-stone-700 transition-all" style={{ width: `${metric.value * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 rounded-[14px] border border-stone-300/70 bg-white/80 p-3 flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-semibold mb-2">Wormholes</p>
                <div className="flex-1 overflow-y-auto space-y-1.5">
                  {wormholeLinks.map(link => {
                    const track = tracks[link.index];
                    if (!track) return null;

                    return (
                      <button
                        key={`${track.name}-${track.release_year}`}
                        onClick={() => setSelectedTrackIndex(link.index)}
                        className="flex w-full items-center justify-between rounded-[10px] border border-stone-300/70 bg-white/90 px-2 py-1.5 text-left text-xs text-stone-700 transition-colors hover:bg-white"
                      >
                        <span className="truncate pr-2 flex-1" title={track.name}>{track.name}</span>
                        <span className="text-stone-600 font-semibold shrink-0">{Math.round(link.similarity * 100)}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Info - Spans all columns */}
            <div className="col-span-2 rounded-[14px] border border-stone-300/70 bg-stone-50/60 p-2.5 text-xs text-stone-700">
              <div className="flex items-center justify-between gap-4">
                <p>t-SNE projection of 5 audio dimensions into 2D • Click clusters to filter, hover tracks to explore</p>
                <p className="text-stone-600 text-[10px]">Tracks: {tracks.length}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'comparison' && (
          <section className="grid h-full gap-2 overflow-y-auto pr-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-2 lg:max-w-[520px]">
              <div className="rounded-[14px] border border-white/22 bg-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">Evolution</p>
                <h3 className="mt-1 text-sm font-semibold text-foreground">Timeline Mutation</h3>

                <div className="mt-2 rounded-[12px] border border-white/22 bg-white/12 p-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-foreground/65">
                    <span>{selectedEra?.label ?? 'N/A'} ({selectedEra?.years ?? '-'})</span>
                    <span>{selectedEra?.count ?? 0} tracks</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(eraProfiles.length - 1, 0)}
                    value={safeSelectedEraIndex}
                    onChange={event => setSelectedEraIndex(Number(event.target.value))}
                    className="mt-2 w-full accent-cyan-400"
                    disabled={eraProfiles.length <= 1}
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                    {eraProfiles.map((era, index) => (
                      <button
                        key={era.label}
                        onClick={() => setSelectedEraIndex(index)}
                        className={`rounded-full border px-2 py-0.5 transition-colors ${index === safeSelectedEraIndex ? 'border-white/35 bg-white/25 text-foreground' : 'border-white/24 bg-white/12 hover:bg-white/20'}`}
                      >
                        {era.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[14px] border border-white/20 bg-white/10 p-3 text-xs leading-5 text-foreground/70">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
                <p>Each era profile is averaged from Madonna tracks only. Delta values compare the selected era against all-time Madonna baseline.</p>
              </div>
            </div>

            <div className="grid gap-2 lg:grid-rows-[auto_1fr]">
              <div className="rounded-[14px] border border-white/22 bg-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">Era vs Baseline</p>
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: 'Danceability', value: selectedEra?.danceability ?? 0, baseline: diva?.danceability ?? 0 },
                    { label: 'Energy', value: selectedEra?.energy ?? 0, baseline: diva?.energy ?? 0 },
                    { label: 'Valence', value: selectedEra?.valence ?? 0, baseline: diva?.valence ?? 0 },
                    { label: 'Acousticness', value: selectedEra?.acousticness ?? 0, baseline: diva?.acousticness ?? 0 },
                    { label: 'Speechiness', value: selectedEra?.speechiness ?? 0, baseline: diva?.speechiness ?? 0 }
                  ].map(metric => (
                    <div key={metric.label} className="rounded-[10px] border border-white/20 bg-white/12 px-2.5 py-2">
                      <div className="mb-1 flex items-center justify-between text-xs text-foreground/60">
                        <span>{metric.label}</span>
                        <span className="text-foreground">{metric.value.toFixed(3)} ({metric.value >= metric.baseline ? '+' : ''}{(metric.value - metric.baseline).toFixed(3)})</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full bg-foreground/70 transition-all duration-700" style={{ width: `${metric.value * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] border border-white/22 bg-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">Diva DNA baseline</p>
                <h3 className="mt-1 text-sm font-semibold text-foreground">Closest pop neighbors</h3>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {closestDivaNeighbors.map(item => (
                    <div key={item.artists} className="rounded-[10px] border border-white/22 bg-white/12 p-2.5 transition-colors hover:bg-white/18">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate pr-2 text-xs font-semibold text-foreground" title={item.artists}>{item.artists}</p>
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] bg-white/16 text-foreground/50">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-[10px] uppercase tracking-[0.16em] text-foreground/45">
                        <div className="flex items-center justify-between"><span>Dance</span><span>{item.danceability.toFixed(3)}</span></div>
                        <div className="flex items-center justify-between"><span>Energy</span><span>{item.energy.toFixed(3)}</span></div>
                        <div className="flex items-center justify-between"><span>Valence</span><span>{item.valence.toFixed(3)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 bg-white/8 px-4 py-2.5 text-[11px] text-foreground/52 sm:px-5 sm:text-xs">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>K-Means clustering, t-SNE projection, and diva comparison are all precomputed and served from JSON.</p>
          <p className="sm:text-right">Madonna tracks analyzed: {madonnaTracks.length}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="liquidGlassWarp" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.6" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="22" xChannelSelector="R" yChannelSelector="G" result="warped" />
            <feColorMatrix
              in="warped"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.05 0"
            />
          </filter>
        </defs>
      </svg>

      {!isFullPage && (
        <Tile
          size={size}
          accentType={accent}
          opacity={opacity}
          onClick={() => setIsOpen(true)}
          className="group cursor-pointer overflow-hidden border border-foreground/20"
        >
          <div className="relative h-full w-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${mdnaTourImage.src})` }}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-[6px] rounded-[10px] border border-white/25" />
          </div>
        </Tile>
      )}

      {isFullPage ? (
        <div
          style={{ backdropFilter: 'url(#liquidGlassWarp) blur(18px) saturate(170%)' }}
          className="flex h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-[22px] border border-stone-300/70 bg-[#f7f2e8]/88 text-stone-900 shadow-[0_26px_100px_rgba(0,0,0,0.32)] sm:h-[calc(100dvh-3rem)]"
        >
          {analysisContent}
        </div>
      ) : (
        <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-lg sm:p-6"
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(56,189,248,0.25)_0%,rgba(56,189,248,0.06)_26%,transparent_52%),radial-gradient(circle_at_78%_82%,rgba(236,72,153,0.20)_0%,rgba(236,72,153,0.06)_24%,transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(255,255,255,0.18)_0.6px,transparent_0.6px)] [background-size:24px_24px]" />
          <motion.div
            onClick={event => event.stopPropagation()}
            style={{ backdropFilter: 'url(#liquidGlassWarp) blur(18px) saturate(170%)' }}
            className="mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[22px] border border-white/20 bg-background/80 text-foreground shadow-[0_26px_100px_rgba(0,0,0,0.45)] sm:h-[calc(100dvh-3rem)]"
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          >
            {analysisContent}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      )}
    </>
  );
};

export default SpotifyAnalysisTile;
