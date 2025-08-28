'use client';

import React from 'react';
import { useAppStore } from '@/state/store';
import { indicatorRegistry } from '@/core/indicators/registry';

interface IndicatorPanelProps {
  className?: string;
}

export default function IndicatorPanel({ className = '' }: IndicatorPanelProps) {
  const { indicators, setIndicatorEnabled, setIndicatorConfig } = useAppStore();

  const allIndicators = indicatorRegistry.getAll();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Indicators</h3>
      
      <div className="space-y-4">
        {allIndicators.map((indicator) => {
          const state = indicators[indicator.id];
          if (!state) return null;

          return (
            <div key={indicator.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.enabled}
                    onChange={(e) => setIndicatorEnabled(indicator.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{indicator.label}</span>
                </label>
              </div>
              
              {state.enabled && (
                <div className="pl-6 space-y-2">
                  {Object.entries(state.config as Record<string, number>).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <label className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const newConfig = {
                            ...(state.config as Record<string, number>),
                            [key]: parseInt(e.target.value) || 1,
                          };
                          setIndicatorConfig(indicator.id, newConfig);
                        }}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        min="1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {allIndicators.length === 0 && (
          <p className="text-sm text-gray-500">No indicators available</p>
        )}
      </div>
    </div>
  );
}