import type { Indicator } from './types';
import type { Candle } from '@/core/data/types';

export interface EMAConfig {
  emaFast: number;
  emaSlow: number;
  trendFast: number;
  trendSlow: number;
  source: 'close' | 'open' | 'high' | 'low';
}

function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];
  
  // First EMA is just the first data point
  ema[0] = data[0];
  
  for (let i = 1; i < data.length; i++) {
    ema[i] = (data[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
  }
  
  return ema;
}

export const emaCrossIndicator: Indicator<EMAConfig> = {
  id: 'emaCross',
  label: 'EMA Cross Scanner',
  defaults: {
    emaFast: 33,
    emaSlow: 55,
    trendFast: 100,
    trendSlow: 200,
    source: 'close',
  },
  
  compute: (candles: Candle[], config: EMAConfig) => {
    const sourceData = candles.map(candle => {
      switch (config.source) {
        case 'open': return candle.o;
        case 'high': return candle.h;
        case 'low': return candle.l;
        case 'close':
        default:
          return candle.c;
      }
    });

    const emaFast = calculateEMA(sourceData, config.emaFast);
    const emaSlow = calculateEMA(sourceData, config.emaSlow);
    const trendFast = calculateEMA(sourceData, config.trendFast);
    const trendSlow = calculateEMA(sourceData, config.trendSlow);

    const overlays = [
      {
        id: 'emaFast',
        seriesType: 'line' as const,
        data: candles.map((candle, i) => ({
          t: candle.t,
          value: emaFast[i] || 0,
        })),
        options: {
          color: '#2196F3', // Blue
          lineWidth: 2,
        },
      },
      {
        id: 'emaSlow',
        seriesType: 'line' as const,
        data: candles.map((candle, i) => ({
          t: candle.t,
          value: emaSlow[i] || 0,
        })),
        options: {
          color: '#F44336', // Red
          lineWidth: 2,
        },
      },
      {
        id: 'trendFast',
        seriesType: 'line' as const,
        data: candles.map((candle, i) => ({
          t: candle.t,
          value: trendFast[i] || 0,
        })),
        options: {
          color: '#4CAF50', // Green
          lineWidth: 1,
          opacity: 0.3,
        },
      },
      {
        id: 'trendSlow',
        seriesType: 'line' as const,
        data: candles.map((candle, i) => ({
          t: candle.t,
          value: trendSlow[i] || 0,
        })),
        options: {
          color: '#4CAF50', // Green
          lineWidth: 1,
          opacity: 0.3,
        },
      },
    ];

    // Calculate trend band area
    const trendBand = candles.map((candle, i) => ({
      t: candle.t,
      value: trendFast[i] || 0,
      baseValue: trendSlow[i] || 0,
    }));

    // Add trend band as area series
    overlays.push({
      id: 'trendBand',
      seriesType: 'line' as const,
      data: trendBand.map(item => ({
        t: item.t,
        value: item.value,
      })),
      options: {
        color: 'rgba(76, 175, 80, 0.5)',
        lineWidth: 0,
      },
    });

    // Calculate cross signals
    const markers = [];
    
    for (let i = 1; i < candles.length; i++) {
      const prevDiff = emaFast[i - 1] - emaSlow[i - 1];
      const currDiff = emaFast[i] - emaSlow[i];
      
      // Bullish cross: fast crosses above slow
      if (prevDiff <= 0 && currDiff > 0) {
        markers.push({
          t: candles[i].t,
          position: 'belowBar' as const,
          shape: 'arrowUp' as const,
          color: '#4CAF50',
          text: 'Bull Cross',
        });
      }
      
      // Bearish cross: fast crosses below slow
      if (prevDiff >= 0 && currDiff < 0) {
        markers.push({
          t: candles[i].t,
          position: 'aboveBar' as const,
          shape: 'arrowDown' as const,
          color: '#F44336',
          text: 'Bear Cross',
        });
      }
    }

    return { overlays, markers };
  },
};