'use client';

import React, { useEffect } from 'react';
import TradingChart from '@/components/TradingChart';
import TimeframeControls from '@/components/TimeframeControls';
import IndicatorPanel from '@/components/IndicatorPanel';
import ChartControls from '@/components/ChartControls';
import { useAppStore } from '@/state/store';
import { indicatorRegistry } from '@/core/indicators/registry';
import { emaCrossIndicator } from '@/core/indicators/emaCross';
import type { Indicator } from '@/core/indicators/types';

export default function Home() {
  const { registerIndicator } = useAppStore();

  // Register indicators on mount
  useEffect(() => {
    indicatorRegistry.register(emaCrossIndicator);
    registerIndicator(emaCrossIndicator as Indicator<unknown>);
  }, [registerIndicator]);

  const handleFitContent = () => {
    // This would need to be implemented in TradingChart
    console.log('Fit content');
  };

  const handleResetZoom = () => {
    // This would need to be implemented in TradingChart
    console.log('Reset zoom');
  };

  const handleScreenshot = () => {
    // This would need to be implemented in TradingChart
    console.log('Take screenshot');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">BTC/USDT Chart</h1>
                <TimeframeControls className="hidden md:flex" />
              </div>
              
              <ChartControls 
                onFitContent={handleFitContent}
                onResetZoom={handleResetZoom}
                onScreenshot={handleScreenshot}
              />
            </div>
            
            <div className="mt-4 md:hidden">
              <TimeframeControls />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-4">
              <div className="h-[70vh] min-h-[400px]">
                <TradingChart />
              </div>
            </div>
            
            <div className="lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-gray-200">
              <IndicatorPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}