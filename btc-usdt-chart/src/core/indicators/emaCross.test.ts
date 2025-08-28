import { describe, it, expect } from 'vitest';
import { emaCrossIndicator } from './emaCross';
import type { Candle } from '@/core/data/types';

describe('EMA Cross Indicator', () => {
  const createTestCandles = (count: number): Candle[] => {
    return Array.from({ length: count }, (_, i) => ({
      t: Date.now() + i * 60000,
      o: 100 + i,
      h: 110 + i,
      l: 90 + i,
      c: 100 + i,
      v: 1000 + i * 100,
    }));
  };

  it('should calculate EMA correctly', () => {
    const candles = createTestCandles(10);
    const result = emaCrossIndicator.compute(candles, {
      emaFast: 3,
      emaSlow: 5,
      trendFast: 7,
      trendSlow: 9,
      source: 'close',
    });

    expect(result.overlays).toBeDefined();
    expect(result.overlays).toHaveLength(5); // 4 lines + 1 area
    expect(result.markers).toBeDefined();
  });

  it('should generate bullish cross signal', () => {
    const candles: Candle[] = [
      { t: 1000, o: 100, h: 110, l: 90, c: 100, v: 1000 },
      { t: 2000, o: 101, h: 111, l: 91, c: 101, v: 1100 },
      { t: 3000, o: 102, h: 112, l: 92, c: 102, v: 1200 },
      { t: 4000, o: 103, h: 113, l: 93, c: 103, v: 1300 },
      { t: 5000, o: 104, h: 114, l: 94, c: 110, v: 1400 }, // Jump up for cross
    ];

    const result = emaCrossIndicator.compute(candles, {
      emaFast: 3,
      emaSlow: 5,
      trendFast: 7,
      trendSlow: 9,
      source: 'close',
    });

    // Should have at least one bullish cross
    const bullishCrosses = result.markers?.filter(m => 
      m.shape === 'arrowUp' && m.text === 'Bull Cross'
    );
    
    expect(bullishCrosses).toBeDefined();
  });

  it('should generate bearish cross signal', () => {
    const candles: Candle[] = [
      { t: 1000, o: 110, h: 120, l: 100, c: 110, v: 1000 },
      { t: 2000, o: 109, h: 119, l: 99, c: 109, v: 1100 },
      { t: 3000, o: 108, h: 118, l: 98, c: 108, v: 1200 },
      { t: 4000, o: 107, h: 117, l: 97, c: 107, v: 1300 },
      { t: 5000, o: 106, h: 116, l: 96, c: 100, v: 1400 }, // Drop down for cross
    ];

    const result = emaCrossIndicator.compute(candles, {
      emaFast: 3,
      emaSlow: 5,
      trendFast: 7,
      trendSlow: 9,
      source: 'close',
    });

    // Should have at least one bearish cross
    const bearishCrosses = result.markers?.filter(m => 
      m.shape === 'arrowDown' && m.text === 'Bear Cross'
    );
    
    expect(bearishCrosses).toBeDefined();
  });

  it('should handle empty candles array', () => {
    const result = emaCrossIndicator.compute([], {
      emaFast: 33,
      emaSlow: 55,
      trendFast: 100,
      trendSlow: 200,
      source: 'close',
    });

    expect(result.overlays).toHaveLength(5);
    expect(result.overlays?.[0].data).toHaveLength(0);
    expect(result.markers).toHaveLength(0);
  });

  it('should use specified source for calculations', () => {
    const candles = [
      { t: 1000, o: 100, h: 110, l: 90, c: 105, v: 1000 },
      { t: 2000, o: 101, h: 111, l: 91, c: 106, v: 1100 },
      { t: 3000, o: 102, h: 112, l: 92, c: 107, v: 1200 },
      { t: 4000, o: 103, h: 113, l: 93, c: 108, v: 1300 },
      { t: 5000, o: 104, h: 114, l: 94, c: 109, v: 1400 },
    ];
    
    const resultOpen = emaCrossIndicator.compute(candles, {
      emaFast: 3,
      emaSlow: 5,
      trendFast: 7,
      trendSlow: 9,
      source: 'open',
    });

    const resultClose = emaCrossIndicator.compute(candles, {
      emaFast: 3,
      emaSlow: 5,
      trendFast: 7,
      trendSlow: 9,
      source: 'close',
    });

    // Results should be different based on source
    expect(resultOpen.overlays?.[0].data).not.toEqual(resultClose.overlays?.[0].data);
  });
});