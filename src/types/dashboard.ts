import { LucideIcon } from 'lucide-react';

export type TileSize = '1x1' | '2x1' | '2x2' | '2x3' | '3x2';

export interface TileConfig {
  id: string;
  size: TileSize;
  label?: string;
  icon?: LucideIcon;
  component?: React.ComponentType<Record<string, unknown>>;
  bgClass?: string;
  props?: Record<string, unknown>;
  group?: string;
}

export interface DashboardGroup {
  id: string;
  title: string;
  tiles: TileConfig[];
}
