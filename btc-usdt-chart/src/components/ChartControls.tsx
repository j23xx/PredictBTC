'use client';

import React from 'react';

interface ChartControlsProps {
  onFitContent?: () => void;
  onScreenshot?: () => void;
  onResetZoom?: () => void;
  className?: string;
}

export default function ChartControls({ 
  onFitContent, 
  onResetZoom,
  className = '' 
}: ChartControlsProps) {
  const handleScreenshot = async () => {
    try {
      // Create a canvas from the chart
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `btc-usdt-chart-${new Date().toISOString().split('T')[0]}.png`;
        link.href = url;
        link.click();
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onFitContent}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        title="Fit content"
      >
        Fit
      </button>
      
      <button
        onClick={onResetZoom}
        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        title="Reset zoom"
      >
        Reset
      </button>
      
      <button
        onClick={handleScreenshot}
        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        title="Take screenshot"
      >
        📸
      </button>
    </div>
  );
}