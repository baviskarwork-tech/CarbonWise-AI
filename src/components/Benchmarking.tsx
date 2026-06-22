'use client';

import React, { useState, useMemo } from 'react';
import { compareAgainstBenchmarks } from '../engine/carbonEngine';
import { BarChart2, Globe, MapPin, Sparkles } from 'lucide-react';
import { formatCarbon } from '../utils/formatters';

interface BenchmarkingProps {
  totalEmissionsKg: number;
}

/**
 * Footprint Benchmarking Component.
 * Compares user emissions against regional averages (US, Europe, India, Global) and calculates percentile ranks.
 */
export const Benchmarking: React.FC<BenchmarkingProps> = React.memo(({ totalEmissionsKg }) => {
  const [selectedRegion, setSelectedRegion] = useState('India');

  // Compute benchmarking comparisons via our Carbon Engine
  const data = useMemo(() => {
    return compareAgainstBenchmarks(totalEmissionsKg, selectedRegion);
  }, [totalEmissionsKg, selectedRegion]);

  const regionChoices = ['India', 'Global', 'Europe', 'US'];

  // Overall percentile relative to global populations
  const globalPercentile = useMemo(() => {
    // High emissions means low percentile. Net zero means 99th percentile.
    const rank = 100 - (totalEmissionsKg / 8000) * 100;
    return Math.max(5, Math.min(99, Math.round(rank)));
  }, [totalEmissionsKg]);

  const maxVal = Math.max(totalEmissionsKg, data.regionalAverage, data.globalAverage, data.indiaAverage, 5000);

  return (
    <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center border-b border-dark-border pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-brand-500" />
          Comparative Benchmarking Engine
        </h2>
        <span className="text-[10px] bg-brand-950/40 text-brand-400 border border-brand-500/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
          <Globe className="h-3 w-3" /> Comparative OS
        </span>
      </div>

      {/* Region Picker Selector */}
      <div className="flex items-center justify-between text-xs bg-dark-card border border-dark-border rounded-lg p-2.5">
        <span className="text-gray-300 font-semibold flex items-center gap-1.5" id="region-selector-label">
          <MapPin className="h-4 w-4 text-brand-500" aria-hidden="true" />
          Compare Region
        </span>
        <div className="flex gap-1.5" role="group" aria-labelledby="region-selector-label">
          {regionChoices.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setSelectedRegion(reg)}
              aria-pressed={selectedRegion === reg}
              aria-label={`Compare against ${reg} average`}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                selectedRegion === reg
                  ? 'bg-brand-600 border border-brand-500 text-white shadow-lg'
                  : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-white'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison results */}
      <div className="flex flex-col gap-4">
        {/* Metric Overview */}
        <div className="rounded-lg bg-dark-card border border-dark-border p-4 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Relative Performance</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {data.comparisonRatio === 1.0 
              ? 'On Par with Baseline' 
              : data.comparisonRatio < 1.0
                ? `${Math.round((1 - data.comparisonRatio) * 100)}% Lower Emissions`
                : `${Math.round((data.comparisonRatio - 1) * 100)}% Higher Emissions`
            }
          </p>
          <span className="text-xs text-gray-400 mt-1 block">
            compared to the average {selectedRegion} citizen ({formatCarbon(data.regionalAverage)})
          </span>
        </div>

        {/* Percentile Rank Card */}
        <div className="bg-brand-950/20 border border-brand-500/20 rounded-lg p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-brand-400 uppercase font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Percentile Ranking
            </span>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              You emit less than <strong className="text-brand-400">{globalPercentile}%</strong> of users globally.
            </p>
          </div>
          <div className="h-14 w-14 rounded-full bg-brand-950/40 border-2 border-brand-500 flex items-center justify-center font-extrabold text-brand-400 text-base shadow-lg shrink-0">
            {globalPercentile}%
          </div>
        </div>

        {/* Benchmarking Charts */}
        <div className="flex flex-col gap-3 mt-2">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
            Annual Footprint Comparison (kg CO₂e)
          </h3>
          
          {/* User Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-gray-200">Your Current Emissions</span>
              <span className="text-white font-bold">{formatCarbon(totalEmissionsKg)}</span>
            </div>
            <div
              className="w-full bg-dark-border h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.min(100, Math.round((totalEmissionsKg / maxVal) * 100))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Your emissions: ${formatCarbon(totalEmissionsKg)}`}
            >
              <div 
                className="h-full rounded-full bg-brand-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, (totalEmissionsKg / maxVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* India Average Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-gray-400">India Average Baseline</span>
              <span className="text-gray-300 font-bold">{formatCarbon(data.indiaAverage)}</span>
            </div>
            <div
              className="w-full bg-dark-border h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.min(100, Math.round((data.indiaAverage / maxVal) * 100))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`India average: ${formatCarbon(data.indiaAverage)}`}
            >
              <div 
                className="h-full rounded-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, (data.indiaAverage / maxVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Global Avg Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-gray-400">Global Average Baseline</span>
              <span className="text-gray-300 font-bold">{formatCarbon(data.globalAverage)}</span>
            </div>
            <div
              className="w-full bg-dark-border h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.min(100, Math.round((data.globalAverage / maxVal) * 100))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Global average: ${formatCarbon(data.globalAverage)}`}
            >
              <div 
                className="h-full rounded-full bg-cyan-600 transition-all duration-500" 
                style={{ width: `${Math.min(100, (data.globalAverage / maxVal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Regional Avg Bar (if not India/Global to show selected) */}
          {selectedRegion !== 'India' && selectedRegion !== 'Global' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-gray-400">{selectedRegion} Average Baseline</span>
                <span className="text-gray-300 font-bold">{formatCarbon(data.regionalAverage)}</span>
              </div>
              <div
                className="w-full bg-dark-border h-2 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.min(100, Math.round((data.regionalAverage / maxVal) * 100))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${selectedRegion} average: ${formatCarbon(data.regionalAverage)}`}
              >
                <div 
                  className="h-full rounded-full bg-slate-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (data.regionalAverage / maxVal) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Benchmarking.displayName = 'Benchmarking';
