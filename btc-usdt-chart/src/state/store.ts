import { create } from 'zustand';
import type { Indicator } from '@/core/indicators/types';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface IndicatorState {
  enabled: boolean;
  config: unknown;
}

interface AppState {
  symbol: string;
  timeframe: Timeframe;
  indicators: Record<string, IndicatorState>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSymbol: (symbol: string) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setIndicatorEnabled: (indicatorId: string, enabled: boolean) => void;
  setIndicatorConfig: (indicatorId: string, config: unknown) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  registerIndicator: (indicator: Indicator<unknown>, defaults?: unknown) => void;
}

export const useAppStore = create<AppState>((set) => ({
  symbol: 'BTCUSDT',
  timeframe: '1h',
  indicators: {},
  isLoading: false,
  error: null,

  setSymbol: (symbol) => set({ symbol }),
  
  setTimeframe: (timeframe) => set({ timeframe }),
  
  setIndicatorEnabled: (indicatorId, enabled) =>
    set((state) => ({
      indicators: {
        ...state.indicators,
        [indicatorId]: {
          ...state.indicators[indicatorId],
          enabled,
        },
      },
    })),
  
  setIndicatorConfig: (indicatorId, config) =>
    set((state) => ({
      indicators: {
        ...state.indicators,
        [indicatorId]: {
          ...state.indicators[indicatorId],
          config,
        },
      },
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  registerIndicator: (indicator, defaults) =>
    set((state) => {
      if (state.indicators[indicator.id]) return state;
      
      return {
        indicators: {
          ...state.indicators,
          [indicator.id]: {
            enabled: false,
            config: defaults || indicator.defaults,
          },
        },
      };
    }),
}));

export const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const BINANCE_INTERVALS: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};