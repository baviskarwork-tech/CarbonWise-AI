'use client';

import React, { useState, useMemo } from 'react';
import { simulateGlobalImpact } from '../engine/carbonEngine';
import { Users, Leaf, Car, Home, Sparkles } from 'lucide-react';

interface GlobalImpactProps {
  annualSavingsKg: number;
}

/**
 * Global Impact Simulator Component.
 * Scales single-user annual savings to estimate community, city, or global offsets.
 */
export const GlobalImpact: React.FC<GlobalImpactProps> = React.memo(({ annualSavingsKg }) => {
  const [multiplier, setMultiplier] = useState(10000); // Default scale: 10,000 users

  // Calculate scaled outcomes using the central Carbon Engine
  const impact = useMemo(() => {
    return simulateGlobalImpact(annualSavingsKg, multiplier);
  }, [annualSavingsKg, multiplier]);

  const presetScales = [
    { label: '1,000 Users', value: 1000 },
    { label: '10,000 Users', value: 10000 },
    { label: '100,000 Users', value: 100000 },
    { label: '1,000,000 Users', value: 1000000 },
  ];

  return (
    <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center border-b border-dark-border pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-500" />
          Global Scaling & Impact Simulator
        </h2>
        <span className="text-[10px] bg-brand-950/40 text-brand-400 border border-brand-500/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Scale Impact
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        What if others adopted your lifestyle reductions? Use the slider to simulate the aggregate environmental offset if scaled to a larger population.
      </p>

      {/* Scaler Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="scaler-slider" className="font-semibold text-gray-300">Scaling Participants</label>
          <span className="font-mono font-bold text-brand-400 text-sm">
            {multiplier.toLocaleString()} users
          </span>
        </div>
        
        <input
          id="scaler-slider"
          type="range"
          min="1000"
          max="1000000"
          step="1000"
          className="w-full h-1.5 rounded-lg cursor-pointer bg-dark-border accent-brand-500"
          value={multiplier}
          onChange={(e) => setMultiplier(parseInt(e.target.value))}
          aria-label="Simulation scale multiplier"
        />

        {/* Quick presets */}
        <div className="grid grid-cols-4 gap-2 mt-1">
          {presetScales.map((scale) => (
            <button
              key={scale.label}
              type="button"
              onClick={() => setMultiplier(scale.value)}
              className={`py-1 text-[10px] font-bold rounded border transition-all ${
                multiplier === scale.value
                  ? 'bg-brand-600 border-brand-500 text-white shadow-lg'
                  : 'bg-dark-card border-dark-border text-gray-400 hover:bg-slate-800'
              }`}
            >
              {scale.label}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Results grid */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="rounded-lg bg-dark-card border border-dark-border p-3.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Leaf className="h-4 w-4 shrink-0" />
            <span>CO₂ Saved</span>
          </div>
          <p className="text-xl font-extrabold text-white mt-1">
            {impact.co2SavedTons.toLocaleString()} Tons
          </p>
          <span className="text-[9px] text-gray-500">annual greenhouse gas emissions avoided</span>
        </div>

        <div className="rounded-lg bg-dark-card border border-dark-border p-3.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Leaf className="h-4 w-4 shrink-0" />
            <span>Trees Equivalent</span>
          </div>
          <p className="text-xl font-extrabold text-white mt-1">
            {impact.treesPlanted.toLocaleString()} Saplings
          </p>
          <span className="text-[9px] text-gray-500">grown for 10 years to absorb equivalent offset</span>
        </div>

        <div className="rounded-lg bg-dark-card border border-dark-border p-3.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <Car className="h-4 w-4 shrink-0" />
            <span>Cars Removed</span>
          </div>
          <p className="text-xl font-extrabold text-white mt-1">
            {impact.carsRemovedYearly.toLocaleString()} cars
          </p>
          <span className="text-[9px] text-gray-500">equivalent passenger vehicles removed/year</span>
        </div>

        <div className="rounded-lg bg-dark-card border border-dark-border p-3.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Home className="h-4 w-4 shrink-0" />
            <span>Homes Powered</span>
          </div>
          <p className="text-xl font-extrabold text-white mt-1">
            {impact.homesPoweredYearly.toLocaleString()} homes
          </p>
          <span className="text-[9px] text-gray-500">offsetting annual electricity consumption</span>
        </div>
      </div>
    </div>
  );
});

GlobalImpact.displayName = 'GlobalImpact';
