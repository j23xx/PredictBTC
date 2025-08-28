'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { useAppStore } from '@/state/store';
import { BinanceDataAdapter } from '@/core/data/binance';
import { indicatorRegistry } from '@/core/indicators/registry';
import type { Candle } from '@/core/data/types';

interface TradingChartProps {
  className?: string;
}

export default function TradingChart({ className = '' }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const indicatorSeriesRef = useRef<Record<string, any>>({});
  
  const { symbol, timeframe, indicators, isLoading, setLoading, setError } = useAppStore();
  const [candles, setCandles] = useState<Candle[]>([]);
  
  const dataAdapter = useMemo(() => new BinanceDataAdapter(), []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#e0e0e0' },
        horzLines: { color: '#e0e0e0' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#e0e0e0',
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    try {
      candlestickSeriesRef.current = (chart as any).addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Create volume series
      volumeSeriesRef.current = (chart as any).addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    } catch (error) {
      console.error('Error creating chart series:', error);
    }

    return () => {
      chart.remove();
    };
  }, []);

  // Fetch historical data when timeframe changes
  useEffect(() => {
    const fetchData = async () => {
      if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const historicalCandles = await dataAdapter.fetchHistory(
          symbol,
          timeframe,
          1000
        );
        
        setCandles(historicalCandles);

        const candlestickData = historicalCandles.map(candle => ({
          time: candle.t / 1000,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c,
        }));

        const volumeData = historicalCandles.map(candle => ({
          time: candle.t / 1000,
          value: candle.v,
          color: candle.c >= candle.o ? '#26a69a' : '#ef5350',
        }));

        candlestickSeriesRef.current.setData(candlestickData);
        volumeSeriesRef.current.setData(volumeData);

        // Fit content
        chartRef.current?.timeScale().fitContent();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe, setLoading, setError, dataAdapter]);

  // Update indicators
  const updateIndicators = useCallback((candles: Candle[]) => {
    if (!candles.length) return;

    Object.entries(indicators).forEach(([indicatorId, state]) => {
      if (!state.enabled) {
        // Remove indicator series if it exists
        if (indicatorSeriesRef.current[indicatorId]) {
          chartRef.current?.removeSeries(indicatorSeriesRef.current[indicatorId]);
          delete indicatorSeriesRef.current[indicatorId];
        }
        return;
      }

      const indicator = indicatorRegistry.get(indicatorId);
      if (!indicator) return;

      const result = indicator.compute(candles, state.config);

      // Update overlays
      result.overlays?.forEach((overlay) => {
        const seriesId = `${indicatorId}_${overlay.id}`;
        
        if (!indicatorSeriesRef.current[seriesId]) {
          let series;
          
          try {
            switch (overlay.seriesType) {
              case 'line':
                series = (chartRef.current as any)?.addLineSeries({
                  color: overlay.options?.color || '#2962FF',
                  lineWidth: overlay.options?.lineWidth || 2,
                });
                break;
              case 'histogram':
                series = (chartRef.current as any)?.addHistogramSeries({
                  color: overlay.options?.color || '#26a69a',
                });
                break;
              case 'area':
                series = (chartRef.current as any)?.addAreaSeries({
                  lineColor: overlay.options?.color || '#2962FF',
                  topColor: overlay.options?.color || '#2962FF',
                  bottomColor: 'rgba(41, 98, 255, 0.28)',
                });
                break;
            }
          } catch (error) {
            console.error('Error creating indicator series:', error);
          }

          if (series) {
            indicatorSeriesRef.current[seriesId] = series;
          }
        }

        const chartData = overlay.data.map(d => ({
          time: d.t / 1000,
          value: d.value,
        }));

        indicatorSeriesRef.current[seriesId]?.setData(chartData);
      });

      // Update markers (TODO: Implement markers)
      if (result.markers) {
        // This would require additional implementation for markers
      }
    });
  }, [indicators]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = dataAdapter.subscribeRealtime(
      symbol,
      timeframe,
      (candle) => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

        setCandles(prevCandles => {
          const newCandles = [...prevCandles];
          const existingIndex = newCandles.findIndex(c => c.t === candle.t);

          if (existingIndex !== -1) {
            newCandles[existingIndex] = candle;
          } else {
            newCandles.push(candle);
            // Keep only last 1000 candles
            if (newCandles.length > 1000) {
              newCandles.shift();
            }
          }

          // Update chart data
          const chartData = {
            time: candle.t / 1000,
            open: candle.o,
            high: candle.h,
            low: candle.l,
            close: candle.c,
          };

          const volumeChartData = {
            time: candle.t / 1000,
            value: candle.v,
            color: candle.c >= candle.o ? '#26a69a' : '#ef5350',
          };

          if (existingIndex !== -1) {
            candlestickSeriesRef.current?.update(chartData);
            volumeSeriesRef.current?.update(volumeChartData);
          } else {
            candlestickSeriesRef.current?.update(chartData);
            volumeSeriesRef.current?.update(volumeChartData);
          }

          return newCandles;
        });

        // Update indicators
        updateIndicators(candles);
      }
    );

    return unsubscribe;
  }, [symbol, timeframe, candles, dataAdapter, updateIndicators]);

  // Update indicators when candles or indicator state changes
  useEffect(() => {
    updateIndicators(candles);
  }, [candles, indicators, updateIndicators]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-gray-600">Loading...</div>
        </div>
      )}
      <div 
        ref={chartContainerRef} 
        className="h-full w-full" 
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}