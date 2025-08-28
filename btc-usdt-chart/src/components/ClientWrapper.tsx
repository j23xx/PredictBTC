'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/state/store';
import { indicatorRegistry } from '@/core/indicators/registry';
import { emaCrossIndicator } from '@/core/indicators/emaCross';
import type { Indicator } from '@/core/indicators/types';
import ChartControls from './ChartControls';
import TimeframeControls from './TimeframeControls';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const { registerIndicator } = useAppStore();

  // Register indicators on mount
  useEffect(() => {
    indicatorRegistry.register(emaCrossIndicator);
    registerIndicator(emaCrossIndicator as Indicator<unknown>);
  }, [registerIndicator]);

  const handleFitContent = () => {
    console.log('Fit content');
  };

  const handleResetZoom = () => {
    console.log('Reset zoom');
  };

  const handleScreenshot = () => {
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
          </div>
          
          <div className="mt-4 md:hidden">
            <TimeframeControls />
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}