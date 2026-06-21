'use client';

import React, { useMemo } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { generate12MonthForecast } from '../../utils/prediction';
import { formatCarbon } from '../../utils/formatters';
import { NATIONAL_AVERAGES } from '../../constants';
import AuthRoute from '../../components/AuthRoute';
import { LineChart, TrendingDown, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <AuthRoute>
      <AnalyticsView />
    </AuthRoute>
  );
}

function AnalyticsView() {
  const { footprints, goals } = useCarbonStore();

  const latestFootprint = footprints.length > 0 ? footprints[footprints.length - 1] : null;
  const currentTotal = latestFootprint ? latestFootprint.totalEmissions : NATIONAL_AVERAGES.TOTAL;
  
  const targetReduction = useMemo(() => {
    if (goals.length > 0) {
      return goals[0].targetReductionPercent;
    }
    return 25; // default simulated target reduction percentage
  }, [goals]);

  // Generate 12-month forecast comparison points
  const forecastData = useMemo(() => {
    return generate12MonthForecast(currentTotal, targetReduction);
  }, [currentTotal, targetReduction]);

  // Math for drawing SVG chart curves
  const chartHeight = 160;
  const chartWidth = 600;
  const maxVal = Math.max(...forecastData.map(d => Math.max(d.businessAsUsual, d.predictedEmissions)));

  const pointsBAU = useMemo(() => {
    return forecastData.map((d, i) => {
      const x = (i / (forecastData.length - 1)) * chartWidth;
      const y = chartHeight - (d.businessAsUsual / maxVal) * chartHeight * 0.8 - 10;
      return `${x},${y}`;
    }).join(' ');
  }, [forecastData, maxVal]);

  const pointsEco = useMemo(() => {
    return forecastData.map((d, i) => {
      const x = (i / (forecastData.length - 1)) * chartWidth;
      const y = chartHeight - (d.predictedEmissions / maxVal) * chartHeight * 0.8 - 10;
      return `${x},${y}`;
    }).join(' ');
  }, [forecastData, maxVal]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <LineChart className="h-7 w-7 text-brand-500" />
          Environmental Intelligence Center
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          BigQuery-style analytics cockpit displaying seasonal emission trends, category offsets, and target trajectory forecast.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: 12-Month Trajectory Area Chart */}
        <div className="lg:col-span-8 glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-dark-border pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-brand-500" />
              12-Month Emission Forecast Trajectory
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-gray-400">Business as Usual (BAU)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-500"></span>
                <span className="text-gray-400">Eco Program Path</span>
              </div>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible"
              aria-label="12-month carbon emission forecast line graph"
              role="img"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const y = chartHeight - p * chartHeight * 0.8 - 10;
                return (
                  <line
                    key={idx}
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    className="stroke-dark-border/40"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* BAU Line */}
              <polyline
                fill="none"
                className="stroke-rose-500"
                strokeWidth="2.5"
                points={pointsBAU}
              />
              
              {/* Eco Line */}
              <polyline
                fill="none"
                className="stroke-brand-500"
                strokeWidth="2.5"
                points={pointsEco}
              />

              {/* Data points markers */}
              {forecastData.map((d, i) => {
                const x = (i / (forecastData.length - 1)) * chartWidth;
                const yBAU = chartHeight - (d.businessAsUsual / maxVal) * chartHeight * 0.8 - 10;
                const yEco = chartHeight - (d.predictedEmissions / maxVal) * chartHeight * 0.8 - 10;
                return (
                  <g key={i}>
                    <circle cx={x} cy={yBAU} r="3" className="fill-rose-500" />
                    <circle cx={x} cy={yEco} r="3" className="fill-brand-500" />
                  </g>
                );
              })}

              {/* Month Labels */}
              {forecastData.map((d, i) => {
                const x = (i / (forecastData.length - 1)) * chartWidth;
                return (
                  <text
                    key={i}
                    x={x}
                    y={chartHeight}
                    textAnchor="middle"
                    className="fill-gray-500 font-mono text-[9px]"
                  >
                    {d.month}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="text-xs text-gray-500 leading-normal flex items-start gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-brand-500 shrink-0" />
            <span>
              The seasonal chart accounts for temperature-driven utility heating waves in winter/summer months, demonstrating path optimizations as weekly actions are successfully checked off.
            </span>
          </div>
        </div>

        {/* Right Side: Key Analytics Cockpit */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Carbon Contribution Breakdown
            </h2>

            <div className="flex flex-col gap-3">
              {[
                { name: 'Transport Sector', amount: latestFootprint ? latestFootprint.breakdown.transport : 5200, color: 'bg-emerald-500' },
                { name: 'Household Utility Energy', amount: latestFootprint ? latestFootprint.breakdown.energy : 4500, color: 'bg-cyan-500' },
                { name: 'Diet & Meals Choices', amount: latestFootprint ? latestFootprint.breakdown.food : 3500, color: 'bg-amber-500' },
                { name: 'Waste Disposal & Recycling', amount: latestFootprint ? latestFootprint.breakdown.waste : 800, color: 'bg-rose-500' },
              ].map((item) => {
                const pct = Math.round((item.amount / currentTotal) * 100) || 0;
                return (
                  <div key={item.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs text-gray-300">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span className={`inline-block h-2 w-2 rounded-full ${item.color}`}></span>
                        {item.name}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Output: {formatCarbon(item.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional comparison */}
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                Regional comparison benchmarks
              </h2>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between border-b border-dark-border/40 pb-2">
                  <span className="text-gray-400">CarbonWise AI Target</span>
                  <span className="font-semibold text-emerald-400">2.0 t CO₂e</span>
                </div>
                <div className="flex justify-between border-b border-dark-border/40 pb-2">
                  <span className="text-gray-400">Global Average Baseline</span>
                  <span className="font-semibold text-gray-300">4.5 t CO₂e</span>
                </div>
                <div className="flex justify-between border-b border-dark-border/40 pb-2">
                  <span className="text-gray-400">Your Current Footprint</span>
                  <span className="font-semibold text-white">{formatCarbon(currentTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">US National Average</span>
                  <span className="font-semibold text-rose-400">16.0 t CO₂e</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-dark-border/40 pt-4 flex items-center gap-1.5 text-[10px] text-gray-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>BigQuery Analytics Integration Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
