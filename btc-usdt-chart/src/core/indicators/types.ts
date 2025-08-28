import type { Candle } from '../data/types';

export type IndicatorRender = {
  overlays?: Array<{
    id: string;
    seriesType: 'line' | 'histogram' | 'area';
    data: Array<{ t: number; value: number }>;
    options?: {
      color?: string;
      lineWidth?: number;
      baseValue?: { type: 'price' };
    };
  }>;
  markers?: Array<{
    t: number;
    position: 'aboveBar' | 'belowBar';
    shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
    color?: string;
    size?: number;
    text?: string;
  }>;
};

export interface Indicator<TConfig = unknown> {
  id: string;
  label: string;
  defaults: TConfig;
  compute: (candles: Candle[], config: TConfig) => IndicatorRender;
}