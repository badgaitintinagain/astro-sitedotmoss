"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Tile from './Tile';
import { MapPinned, Radar, Sparkles } from 'lucide-react';
import clusterSummaryData from '../assets/data/cluster_summary.json';
import divaDnaData from '../assets/data/diva_dna.json';
import musicGalaxyData from '../assets/data/music_galaxy.json';
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
  speechiness: number;
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

const CLUSTER_NAMES: Record<number, { name: string; description: string; color: string }> = {
  0: { name: 'The Disco Dynamo', description: 'High energy, danceable pop hits', color: '#FF4D8D' },
  1: { name: 'The Vulnerable Soul', description: 'Emotional ballads with acoustic warmth', color: '#22C55E' },
  2: { name: 'The Modern Rebel', description: 'Electronic, bold, experimental tracks', color: '#FACC15' },
  3: { name: 'The Intimate Whisper', description: 'Acoustic, introspective, vulnerable', color: '#38BDF8' }
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
const getTrackKey = (track: {name: string, release_year: number}) => `${track.name}::${track.release_year}`;

const projectTsnePoint = (value: number, min: number, max: number, size: number, padding = 36) => {
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
  const [activeTab, setActiveTab] = useState<'personas' | 'galaxy' | 'comparison'>('personas');
  const [selectedCluster, setSelectedCluster] = useState(0);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [selectedEraIndex, setSelectedEraIndex] = useState(0);
  const [discoImageIndex, setDiscoImageIndex] = useState(0);

  const clusters = clusterSummaryData as ClusterData[];
  const tracks = useMemo(() => (musicGalaxyData as TrackData[]).filter(track => track.release_year <= 2020), []);
  const divas = divaDnaData as DivaData[];

  const trackFeatureSpace = useMemo(() => new TrackFeatureSpace(tracks), [tracks]);
  const wormholeLinks = useMemo(() => trackFeatureSpace.getTopSimilarTracks(selectedTrackIndex, 5), [trackFeatureSpace, selectedTrackIndex]);

  const trackIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    tracks.forEach((track, index) => {
      map.set(getTrackKey(track), index);
    });
    return map;
  }, [tracks]);

  const madonnaTracks = useMemo(() => tracks.filter(track => String(track.artists).includes('Madonna')), [tracks]);
  const selectedTrack = tracks[selectedTrackIndex] ?? tracks[0];
  
  if (!tracks.length) {
      return <div className="p-8 font-mono text-xs font-semibold text-stone-500">Connecting_to_Galaxy_Node...</div>;
  }

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

  const weightedClusterImpact = useMemo(() => {
    const map: Record<number, { weightedSum: number; share: number; meanWeight: number }> = {
      0: { weightedSum: 0, share: 0, meanWeight: 0 },
      1: { weightedSum: 0, share: 0, meanWeight: 0 },
      2: { weightedSum: 0, share: 0, meanWeight: 0 },
      3: { weightedSum: 0, share: 0, meanWeight: 0 }
    };
    tracks.forEach((track) => {
      map[track.cluster].weightedSum += 1;
    });
    const total = Object.values(map).reduce((sum, entry) => sum + entry.weightedSum, 0) || 1;
    Object.keys(map).forEach(clusterKey => {
      const cluster = Number(clusterKey);
      map[cluster].share = map[cluster].weightedSum / total;
    });
    return map;
  }, [tracks]);

  const selectedClusterTracks = useMemo(
    () => tracks.filter(track => track.cluster === selectedCluster).sort((left, right) => right.release_year - left.release_year),
    [tracks, selectedCluster]
  );

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
        const aggregate = bucketTracks.reduce((acc, t) => {
          acc.danceability += t.danceability;
          acc.energy += t.energy;
          acc.valence += t.valence;
          acc.acousticness += t.acousticness;
          acc.speechiness += t.speechiness;
          return acc;
        }, { danceability: 0, energy: 0, valence: 0, acousticness: 0, speechiness: 0 });
        const count = bucketTracks.length;
        return {
          label: bucket.label, years: `${bucket.min}-${bucket.max}`, count,
          danceability: aggregate.danceability / count,
          energy: aggregate.energy / count,
          valence: aggregate.valence / count,
          acousticness: aggregate.acousticness / count,
          speechiness: aggregate.speechiness / count
        };
      })
      .filter((p): p is EraProfile => Boolean(p));
  }, [madonnaTracks]);

  const safeSelectedEraIndex = clamp(selectedEraIndex, 0, Math.max(eraProfiles.length - 1, 0));
  const selectedEra = eraProfiles[safeSelectedEraIndex] ?? eraProfiles[0];
  const diva = useMemo(() => divas.find(item => item.artists === 'Madonna') ?? divas[0], [divas]);
  const closestDivaNeighbors = useMemo(() => divas
    .filter(item => item.artists !== 'Madonna')
    .sort((left, right) => Math.abs(left.energy - (diva?.energy ?? 0)) - Math.abs(right.energy - (diva?.energy ?? 0)))
    .slice(0, 6), [diva, divas]);

  const handleClusterSelect = useCallback((cluster: number) => {
    setSelectedCluster(cluster);
    const dominantTrackIndex = tracks.findIndex(track => track.cluster === cluster);
    if (dominantTrackIndex >= 0) setSelectedTrackIndex(dominantTrackIndex);
  }, [tracks]);

  if (!isFullPage) {
    return (
        <Tile
          size={size}
          label="Sonic Atlas"
          bgImage={mdnaTourImage.src}
          accentType={accent}
          opacity={opacity}
          onClick={() => window.location.href = '/spotify'}
        />
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-[540px] overflow-hidden bg-[#f8efe4]/78 text-stone-800 font-mono border border-stone-200 backdrop-blur-md">
        <div className="flex-1 overflow-hidden p-2 bg-transparent">
        <div className="flex h-full gap-2 flex-col md:flex-row">
          <aside className="w-full md:w-32 shrink-0 border-b md:border-b-0 md:border-r border-stone-200 pr-0 md:pr-2 pb-2 md:pb-0 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar">
                    {(['personas', 'galaxy', 'comparison'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-2 py-1.5 border transition-all text-[10px] font-bold whitespace-nowrap ${activeTab === tab ? 'bg-[#f5e7d7] text-stone-900 border-[#cfb59a]' : 'border-stone-200 hover:bg-white/80 text-stone-500 hover:text-stone-900'}`}>
                            [{TAB_META[tab].title.toUpperCase()}]
                        </button>
                    ))}
                </aside>

          <div className="flex-1 overflow-y-auto no-scrollbar bg-white/68 p-3 md:p-4 border border-stone-200">
                    {activeTab === 'personas' && (
                        <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                                {clusters.map(c => {
                                    const active = selectedCluster === c.cluster;
                                    const meta = CLUSTER_NAMES[c.cluster];
                                    return (
                      <button key={c.cluster} onClick={() => handleClusterSelect(c.cluster)} className={`border p-2 transition-all text-center relative overflow-hidden ${active ? 'border-[#cfb59a] bg-[#f5e7d7] text-stone-900' : 'border-stone-200 text-stone-600 hover:text-stone-900 bg-white/60'}`}>
                                            <div className="w-full h-0.5 absolute top-0 left-0" style={{backgroundColor: meta.color}} />
                                            <div className="text-[9px] font-bold">{meta.name.toUpperCase()}</div>
                                        </button>
                                    );
                                })}
                            </div>

                <div className="border border-stone-200 p-4 bg-white/78 relative">
                  <div className="absolute top-2 right-2 text-[9px] font-bold border border-stone-200 px-1.5 py-0.5 text-stone-500">SHARE::{Math.round((weightedClusterImpact[selectedCluster]?.share || 0)*100)}%</div>
                  <h3 className="text-xl font-bold tracking-tight mb-1 text-stone-900 uppercase">{selectedClusterMeta.name}</h3>
                                <p className="text-[10px] font-bold text-stone-500 mb-4 max-w-xl leading-tight uppercase tracking-tight">{selectedClusterMeta.description}</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                    {[
                                        { label: 'Danceability', value: clusters[selectedCluster]?.danceability || 0 },
                                        { label: 'Energy', value: clusters[selectedCluster]?.energy || 0 },
                                        { label: 'Valence', value: clusters[selectedCluster]?.valence || 0 },
                                        { label: 'Acousticness', value: clusters[selectedCluster]?.acousticness || 0 }
                                    ].map(m => (
                                        <div key={m.label} className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-bold text-stone-600 uppercase"><span>{m.label}</span><span>{Math.round(m.value*100)}</span></div>
                                            <div className="h-[1px] bg-white/5"><div className="h-full transition-all duration-1000" style={{width: `${m.value*100}%`, backgroundColor: selectedClusterMeta.color}} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'galaxy' && (
                        <div className="grid h-full gap-2 lg:grid-cols-[minmax(0,1.3fr)_240px]">
                        <div className="h-full relative border border-stone-200 bg-white/65 overflow-hidden min-h-[280px]">
                                <svg className="w-full h-full" viewBox="0 0 1000 620">
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
                                                stroke="white"
                                                strokeWidth={0.5 + opacity}
                                                strokeOpacity={opacity * 0.3}
                                                strokeDasharray="2 2"
                                            />
                                        );
                                    })}
                                    {tracks.map((t, i) => {
                                        const meta = CLUSTER_NAMES[t.cluster];
                                        const x = projectTsnePoint(t.tsne_x, tsneBounds.minX, tsneBounds.maxX, 1000);
                                        const y = projectTsnePoint(t.tsne_y, tsneBounds.minY, tsneBounds.maxY, 620);
                                        const active = selectedTrack.name === t.name;
                                        return (
                                            <rect key={i} x={x-2} y={y-2} width={active ? 8 : 4} height={active ? 8 : 4} fill={active ? 'white' : meta.color} className="cursor-pointer transition-all hover:opacity-100 opacity-60" onClick={() => setSelectedTrackIndex(i)} />
                                        );
                                    })}
                                </svg>
                            </div>
                            <div className="space-y-2 h-full overflow-y-auto pr-1">
                                <div className="border border-stone-200 p-3 bg-white/75">
                                  <h4 className="text-[9px] font-bold mb-1 border-b border-stone-200 pb-1 text-stone-500 uppercase">Selected_Node</h4>
                                    <div className="mt-1 flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                      <h4 className="w-full truncate text-[11px] font-bold text-stone-800" title={selectedTrack?.name}>{selectedTrack?.name}</h4>
                                            <p className="text-[9px] text-stone-500">{selectedTrack?.release_year}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2 text-[9px] font-bold">
                                        {[
                                            { label: 'Danceability', value: selectedTrack?.danceability ?? 0 },
                                            { label: 'Energy', value: selectedTrack?.energy ?? 0 },
                                            { label: 'Valence', value: selectedTrack?.valence ?? 0 },
                                            { label: 'Acousticness', value: selectedTrack?.acousticness ?? 0 }
                                        ].map(metric => (
                                            <div key={metric.label}>
                                                <div className="mb-0.5 flex items-center justify-between text-stone-600 uppercase">
                                                    <span>{metric.label}</span>
                                                    <span className="text-stone-400">{Math.round(metric.value * 100)}</span>
                                                </div>
                                                <div className="h-[1px] bg-stone-200"><div className="h-full bg-stone-500/35 transition-all duration-500" style={{ width: `${metric.value * 100}%` }} /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                        <div className="border border-stone-200 p-3 bg-white/75">
                                          <h4 className="text-[9px] font-bold mb-1 border-b border-stone-200 pb-1 text-stone-500 uppercase">Proximal_Links</h4>
                                    <div className="mt-1 space-y-1">
                                        {wormholeLinks.map(link => {
                                            const track = tracks[link.index];
                                            if (!track) return null;

                                            return (
                                                <button
                                                    key={`${track.name}-${track.release_year}`}
                                                    onClick={() => setSelectedTrackIndex(link.index)}
                                                    className="flex min-w-0 w-full items-center justify-between border border-stone-200 bg-white/65 px-2 py-1 text-left text-[9px] font-bold text-stone-600 transition-colors hover:bg-white hover:text-stone-900"
                                                >
                                                    <span className="min-w-0 flex-1 truncate pr-2" title={track.name}>{track.name.toUpperCase()}</span>
                                                    <span className="ml-2 shrink-0 text-stone-700">{Math.round(link.similarity * 100)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-stone-200 p-4 bg-white/75">
                            <h4 className="text-[9px] font-bold mb-3 border-b border-stone-200 pb-1 text-stone-500 uppercase">Timeline_Mutation</h4>
                                <div className="space-y-3">
                                    <input type="range" min={0} max={eraProfiles.length-1} value={safeSelectedEraIndex} onChange={e => setSelectedEraIndex(Number(e.target.value))} className="w-full accent-white h-1" />
                                    <div className="grid grid-cols-4 gap-1">
                                        {eraProfiles.map((p, i) => (
                                          <button key={i} onClick={() => setSelectedEraIndex(i)} className={`border px-1 py-1 text-[9px] font-bold ${i === safeSelectedEraIndex ? 'bg-[#f5e7d7] text-stone-900 border-[#cfb59a]' : 'border-stone-200 text-stone-500 hover:text-stone-900 bg-white/60'}`}>{p.label}</button>
                                        ))}
                                    </div>
                                </div>
                                    <div className="mt-6 border-t border-stone-200 pt-3">
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Danceability', value: selectedEra?.danceability ?? 0, baseline: diva?.danceability ?? 0 },
                                            { label: 'Energy', value: selectedEra?.energy ?? 0, baseline: diva?.energy ?? 0 },
                                            { label: 'Valence', value: selectedEra?.valence ?? 0, baseline: diva?.valence ?? 0 },
                                            { label: 'Acousticness', value: selectedEra?.acousticness ?? 0, baseline: diva?.acousticness ?? 0 },
                                            { label: 'Speechiness', value: selectedEra?.speechiness ?? 0, baseline: diva?.speechiness ?? 0 }
                                        ].map(metric => (
                                            <div key={metric.label}>
                                                <div className="mb-0.5 flex items-center justify-between text-[9px] font-bold text-stone-600 uppercase">
                                                    <span>{metric.label}</span>
                                                    <span className="text-stone-400">{metric.value.toFixed(2)}</span>
                                                </div>
                                                <div className="h-[1px] bg-stone-200">
                                                  <div className="h-full bg-stone-500/35 transition-all duration-700" style={{ width: `${metric.value * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                                      <div className="border border-stone-200 p-4 bg-white/75">
                                        <h4 className="text-[9px] font-bold mb-3 border-b border-stone-200 pb-1 text-stone-500 uppercase">Diva_Dna_Links</h4>
                                <div className="grid grid-cols-1 gap-1">
                                    {closestDivaNeighbors.map((n, i) => (
                                            <div key={i} className="flex items-center justify-between border border-stone-200 p-2 bg-white/65">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase">{n.artists}</span>
                                            <div className="flex gap-2 text-[9px] font-bold text-stone-600">
                                                <span>D.{Math.round(n.danceability*100)}</span>
                                                <span>E.{Math.round(n.energy*100)}</span>
                                                <span>V.{Math.round(n.valence*100)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SpotifyAnalysisTile;
