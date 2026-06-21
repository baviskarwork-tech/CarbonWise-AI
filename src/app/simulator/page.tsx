'use client';

import React, { useState, useMemo } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { calculateSimulatedEmissions } from '../../utils/prediction';
import { formatCarbon, formatPercent } from '../../utils/formatters';
import { NATIONAL_AVERAGES } from '../../constants';
import { Sliders, Leaf, ShieldAlert, Compass } from 'lucide-react';

export default function SimulatorPage() {
  const { footprints, unlockBadge, currentUser } = useCarbonStore();

  // If no calculation is available, use the national average baseline as a template
  const baselineBreakdown = useMemo(() => {
    if (footprints.length > 0) {
      return footprints[footprints.length - 1].breakdown;
    }
    return {
      transport: NATIONAL_AVERAGES.TRANSPORT,
      energy: NATIONAL_AVERAGES.ENERGY,
      food: NATIONAL_AVERAGES.FOOD,
      waste: NATIONAL_AVERAGES.WASTE,
    };
  }, [footprints]);

  // Sliders state (representing % reduction or % recycling rate)
  const [carReduction, setCarReduction] = useState(0);
  const [flightReduction, setFlightReduction] = useState(0);
  const [electricityReduction, setElectricityReduction] = useState(0);
  const [meatReduction, setMeatReduction] = useState(0);
  const [recyclingIncrease, setRecyclingIncrease] = useState(0);

  const sliderValues = useMemo(() => ({
    carReduction,
    flightReduction,
    electricityReduction,
    meatReduction,
    recyclingIncrease,
  }), [carReduction, flightReduction, electricityReduction, meatReduction, recyclingIncrease]);

  // Run real-time simulation math
  const sim = useMemo(() => {
    const results = calculateSimulatedEmissions(baselineBreakdown, sliderValues);
    
    // Check if user has simulated a 50% reduction. If logged in, trigger achievement.
    if (results.percentReduction >= 50 && currentUser) {
      unlockBadge('net_zero_hero');
    }

    return results;
  }, [baselineBreakdown, sliderValues, currentUser, unlockBadge]);

  const sliderSpecs = [
    {
      label: 'Car Travel Reduction',
      value: carReduction,
      setter: setCarReduction,
      color: 'accent-brand-500',
      description: 'Replace short trips with walking/cycling, carpool, or switch to an EV.',
    },
    {
      label: 'Flight Frequencies Reduction',
      value: flightReduction,
      setter: setFlightReduction,
      color: 'accent-brand-500',
      description: 'Opt for train alternatives, take vacations closer to home, or use video calls.',
    },
    {
      label: 'Home Electricity & HVAC Savings',
      value: electricityReduction,
      setter: setElectricityReduction,
      color: 'accent-brand-500',
      description: 'Lower thermostat heating, purchase ENERGY STAR appliances, or install home solar.',
    },
    {
      label: 'Dietary Meat Consumption Reduction',
      value: meatReduction,
      setter: setMeatReduction,
      color: 'accent-brand-500',
      description: 'Replace beef and dairy meals with plant proteins, legumes, and oats.',
    },
    {
      label: 'Recycling & Organic Composting Rate',
      value: recyclingIncrease,
      setter: setRecyclingIncrease,
      color: 'accent-brand-500',
      description: 'Separate glass, metals, and food scraps from standard household trash.',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Sliders className="h-7 w-7 text-brand-500" />
          Predictive Carbon Simulator
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Model customized lifestyle goals and immediately view future reductions, target outcomes, and forest equivalents.
        </p>
      </div>

      {footprints.length === 0 && (
        <div className="rounded-lg bg-amber-950/30 border border-amber-500/20 p-4 text-xs text-amber-400">
          ⚠️ **Simulation Template Mode**: You have not filled out the Carbon Calculator yet. We are using average national baselines for this simulation. Calculate your actual footprint to get personalized estimates!
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Hand Sliders panel */}
        <div className="lg:col-span-7 glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col gap-6">
          <h2 className="text-lg font-bold text-white border-b border-dark-border pb-3">
            Simulate Reduction Scenarios
          </h2>

          <div className="flex flex-col gap-6">
            {sliderSpecs.map((spec) => (
              <div key={spec.label} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-200">{spec.label}</span>
                  <span className="font-mono font-bold text-brand-500 text-sm">-{spec.value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className={`w-full h-1.5 rounded-lg cursor-pointer bg-dark-border ${spec.color}`}
                  value={spec.value}
                  onChange={(e) => spec.setter(parseInt(e.target.value))}
                />
                <span className="text-[10px] text-gray-500">{spec.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Hand Calculations Cockpit */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Comparison Card */}
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col gap-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Projected Reduction Metrics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-dark-card border border-dark-border p-3.5">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Current Profile</span>
                <p className="text-2xl font-extrabold text-white mt-1">{formatCarbon(sim.currentTotal)}</p>
              </div>

              <div className="rounded-lg bg-brand-950/30 border border-brand-500/20 p-3.5">
                <span className="text-[10px] text-brand-400 uppercase font-bold">Projected Future</span>
                <p className="text-2xl font-extrabold text-brand-400 mt-1">{formatCarbon(sim.simulatedTotal)}</p>
              </div>
            </div>

            {/* Savings Indicator */}
            <div className="bg-slate-900/50 rounded-lg border border-dark-border p-4 text-center">
              <span className="text-xs text-gray-400">Estimated Annual Savings</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                {formatCarbon(sim.annualSavings)}
              </p>
              <div className="mt-2 text-xs bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 py-1 px-3 rounded-full inline-block font-semibold">
                Saved {formatPercent(sim.percentReduction)} of current output
              </div>
            </div>
          </div>

          {/* Environmental Equivalencies */}
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Environmental Equivalency Outcomes
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Leaf className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Equivalent Trees Grown</span>
                  <p className="text-base font-bold text-white">{sim.environmentalImpact.treesPlanted} tree saplings</p>
                  <p className="text-[10px] text-gray-400">grown for 10 years to absorb equivalent carbon footprint offset</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Avoided Coal Combustion</span>
                  <p className="text-base font-bold text-white">{sim.environmentalImpact.coalBurnedAvoidedKg} kg of coal</p>
                  <p className="text-[10px] text-gray-400">offsetting raw coal fuel burning emissions at thermal plants</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0">
                  <Compass className="h-5 w-5 rotate-12" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Avoided Passenger Miles</span>
                  <p className="text-base font-bold text-white">{sim.environmentalImpact.carMilesAvoided.toLocaleString()} miles</p>
                  <p className="text-[10px] text-gray-400">equal to driving average gasoline-powered passenger sedans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
