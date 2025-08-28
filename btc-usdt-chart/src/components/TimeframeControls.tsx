'use client';

import React from 'react';
import { useAppStore, TIMEFRAMES } from '@/state/store';

interface TimeframeControlsProps {
  className?: string;
}

export default function TimeframeControls({ className = '' }: TimeframeControlsProps) {
  const { timeframe, setTimeframe } = useAppStore();

  return (
    <div className={`flex gap-2 ${className}`}>
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => setTimeframe(tf)}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            timeframe === tf
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}