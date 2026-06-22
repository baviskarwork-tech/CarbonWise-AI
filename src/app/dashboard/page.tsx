'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCarbonStore } from '../../store/useCarbonStore';
import AuthRoute from '../../components/AuthRoute';
import { calculateSustainabilityScore, getGradeBadgeColor } from '../../utils/score';
import { formatCarbon, formatDate } from '../../utils/formatters';
import { BADGES } from '../../constants';
import { Benchmarking } from '../../components/Benchmarking';
import { GlobalImpact } from '../../components/GlobalImpact';
import { calculateNetZeroDate, predictFutureEmissions } from '../../engine/carbonEngine';
import { 
  Award, 
  Leaf, 
  Brain, 
  CalendarCheck, 
  Loader2, 
  CheckSquare, 
  Square,
  Sparkles,
  Car,
  Zap,
  ChefHat,
  Trash2,
  TrendingDown,
  LineChart,
  ShieldCheck,
  Target
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <AuthRoute>
      <DashboardView />
    </AuthRoute>
  );
}

function DashboardView() {
  const { 
    footprints, 
    activePlan, 
    achievements, 
    dataLoading, 
    toggleTaskCompletion, 
    saveGeneratedPlan 
  } = useCarbonStore();

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState('');
  const [activeTab, setActiveTab] = useState<'intelligence' | 'breakdown' | 'actions'>('intelligence');

  const latestFootprint = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  // Compute sustainability score
  const scoreObj = useMemo(() => {
    return latestFootprint 
      ? calculateSustainabilityScore(latestFootprint.breakdown)
      : { score: 0, grade: 'Poor' as const, breakdownScores: { transport: 0, energy: 0, food: 0, waste: 0 } };
  }, [latestFootprint]);

  // Compute Net Zero projections
  const netZero = useMemo(() => {
    if (!latestFootprint) return null;
    // Calculate based on a 25% target annual reduction savings
    const annualSavings = Math.round(latestFootprint.totalEmissions * 0.25);
    return calculateNetZeroDate(latestFootprint.totalEmissions, annualSavings, 30);
  }, [latestFootprint]);

  // Compute 12-month future forecast line chart data
  const forecastPoints = useMemo(() => {
    if (!latestFootprint) return [];
    return predictFutureEmissions(latestFootprint.totalEmissions, 30);
  }, [latestFootprint]);

  // Calculate score circle percentage
  const strokeDashoffset = 251.2 - (251.2 * scoreObj.score) / 100;

  const handleGeneratePlan = async () => {
    if (!latestFootprint) return;
    setGeneratingPlan(true);
    setPlanError('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'plan',
          prompt: 'Generate a weekly carbon reduction action plan.',
          footprintData: latestFootprint.breakdown,
        }),
      });

      if (!response.ok) throw new Error('AI Coach service unavailable.');
      const data = await response.json();
      
      if (data?.weeks) {
        await saveGeneratedPlan(data.weeks);
      } else {
        throw new Error('AI returned invalid action items.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to generate weekly actions.';
      setPlanError(errMsg);
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm font-medium text-gray-400">Loading audit profile...</p>
      </div>
    );
  }

  // Empty State: No calculations yet
  if (!latestFootprint) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12 px-4">
        <div className="glass-panel rounded-2xl border border-dark-border p-8 md:p-12 shadow-2xl flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-950/40 text-brand-500 border border-brand-500/20 mb-6">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to CarbonWise AI</h1>
          <p className="text-sm text-gray-400 mb-6 max-w-md">
            To view emissions trends, unlock progress badges, and generate AI Weekly plans, please calculate your footprint first.
          </p>
          <Link
            href="/calculator"
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            Run First Calculation
          </Link>
        </div>
      </div>
    );
  }

  // Calculate annual savings for simulator fallback
  const simulatedSavings = latestFootprint ? Math.round(latestFootprint.totalEmissions * 0.25) : 0;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Dashboard Summary Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-brand-500" />
            Sustainability Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Data profile updated on {formatDate(latestFootprint.calculatedAt)}
          </p>
        </div>
        <Link
          href="/calculator"
          className="rounded-lg border border-dark-border bg-dark-card px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Recalculate Carbon
        </Link>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex border-b border-dark-border gap-6 text-sm font-bold w-full" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'intelligence'}
          onClick={() => setActiveTab('intelligence')}
          className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'intelligence'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Brain className="h-4 w-4" />
          Carbon Intelligence Center
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'breakdown'}
          onClick={() => setActiveTab('breakdown')}
          className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'breakdown'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          Emissions Sectors
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'actions'}
          onClick={() => setActiveTab('actions')}
          className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-2 ${
            activeTab === 'actions'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          Actions & Badges
        </button>
      </div>

      {/* -------------------- TAB 1: CARBON INTELLIGENCE CENTER -------------------- */}
      {activeTab === 'intelligence' && (
        <div className="flex flex-col gap-8 w-full animate-fadeIn">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Carbon Score Card */}
            <div className="glass-panel border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Carbon Score</h2>
              <div className="relative flex items-center justify-center h-36 w-36">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="40"
                    className="stroke-dark-border fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="40"
                    className="stroke-brand-500 fill-none transition-all duration-1000"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white">{scoreObj.score}</span>
                  <span className="text-[10px] uppercase text-gray-400 font-bold">Points</span>
                </div>
              </div>
              <div className={`mt-4 rounded-full px-3 py-1 text-xs font-semibold uppercase ${getGradeBadgeColor(scoreObj.grade)}`}>
                Grade: {scoreObj.grade}
              </div>
            </div>

            {/* Total Emissions card */}
            <div className="glass-panel border border-dark-border rounded-xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-2">Total Carbon Output</h2>
                <p className="text-4xl font-extrabold text-white">{formatCarbon(latestFootprint.totalEmissions, 1)}</p>
                <p className="text-xs text-gray-500 mt-1">Estimated annual greenhouse gas equivalent</p>
              </div>
              <div className="mt-4 border-t border-dark-border/45 pt-4 flex justify-between items-center text-xs">
                <span className="text-gray-400">Target Net-Zero Goal Limit</span>
                <span className="font-semibold text-emerald-500">2,000 kg / Year</span>
              </div>
            </div>

            {/* Net Zero Forecast Widget */}
            {netZero && (
              <div className="glass-panel border border-dark-border rounded-xl p-6 flex flex-col justify-between shadow-lg">
                <div>
                  <h2 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                    Net-Zero Forecast
                  </h2>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-4xl font-extrabold text-white">{netZero.projectedNetZeroYear}</span>
                    <span className="text-xs text-emerald-400 font-semibold">(Est. Target)</span>
                  </div>
                  
                  {/* Confidence Score Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-semibold mb-1">
                      <span className="text-gray-400">Projection Confidence</span>
                      <span className="text-brand-400">{netZero.confidenceScore}%</span>
                    </div>
                    <div className="w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-brand-500 transition-all" 
                        style={{ width: `${netZero.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-dark-border/45 pt-4 flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Reduction target:</span>
                    <span className="font-bold text-gray-200">-{formatCarbon(netZero.targetReduction)} (30%)</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400">Needed monthly cut:</span>
                    <span className="font-bold text-brand-400">-{netZero.monthlyReductionNeeded} kg/mo</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trend Analysis & Future Forecast SVG Line Chart */}
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg w-full flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <LineChart className="h-4.5 w-4.5 text-brand-500" />
              12-Month Emission Trend Analysis & Forecast
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Compares your estimated monthly emissions trajectory under Business-as-Usual (BAU) with a targeted Net-Zero Program Path (30% reduction target).
            </p>

            {forecastPoints.length > 0 && (
              <div className="w-full mt-2">
                {/* SVG Visualizing the Trend Chart */}
                <div className="relative h-48 w-full bg-dark-card/50 border border-dark-border/40 rounded-lg p-4 flex items-end">
                  <svg className="absolute inset-x-0 bottom-4 h-36 w-full px-8" viewBox="0 0 500 100" preserveAspectRatio="none">
                    {/* Gridlines */}
                    <line x1="0" y1="20" x2="500" y2="20" className="stroke-dark-border/30" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="500" y2="50" className="stroke-dark-border/30" strokeWidth="0.5" />
                    <line x1="0" y1="80" x2="500" y2="80" className="stroke-dark-border/30" strokeWidth="0.5" />

                    {/* BAU Path (Red/Grey Line) */}
                    <path
                      d={forecastPoints.map((pt, idx) => {
                        const x = (idx / 11) * 500;
                        const y = 90 - (pt.businessAsUsual / (latestFootprint.totalEmissions / 12 * 1.5)) * 80;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      className="fill-none stroke-rose-500/50"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Net-Zero Path (Brand Green Line) */}
                    <path
                      d={forecastPoints.map((pt, idx) => {
                        const x = (idx / 11) * 500;
                        const y = 90 - (pt.predictedEmissions / (latestFootprint.totalEmissions / 12 * 1.5)) * 80;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      className="fill-none stroke-brand-500"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Interactive dots representing predictions */}
                    {forecastPoints.map((pt, idx) => {
                      const x = (idx / 11) * 500;
                      const y = 90 - (pt.predictedEmissions / (latestFootprint.totalEmissions / 12 * 1.5)) * 80;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3"
                          className="fill-brand-400 stroke-dark-bg"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="absolute inset-x-0 bottom-1 flex justify-between px-8 text-[8px] font-mono text-gray-500">
                    {forecastPoints.map((pt) => <span key={pt.month}>{pt.month}</span>)}
                  </div>
                </div>

                {/* Chart Legends */}
                <div className="flex gap-4 mt-2 justify-center text-[10px] text-gray-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="h-0.5 w-4 bg-rose-500/50 border-t border-dashed border-rose-400" />
                    <span>Business as Usual (BAU)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-0.5 w-4 bg-brand-500" />
                    <span>Net-Zero Program Path (-30%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comparative Benchmarking and Scaling Simulators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <Benchmarking totalEmissionsKg={latestFootprint.totalEmissions} />
            <GlobalImpact annualSavingsKg={simulatedSavings} />
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: SECTORS BREAKDOWN -------------------- */}
      {activeTab === 'breakdown' && (
        <div className="flex flex-col gap-6 w-full animate-fadeIn">
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg w-full">
            <h2 className="text-lg font-bold text-white mb-6">Emissions Sector Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 w-full">
              {Object.entries(latestFootprint.breakdown).map(([category, amount]) => {
                const pct = Math.round((amount / latestFootprint.totalEmissions) * 100) || 0;
                
                const meta: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
                  transport: { color: 'bg-cyan-500', icon: Car, label: 'Transport' },
                  energy: { color: 'bg-amber-500', icon: Zap, label: 'Utilities' },
                  food: { color: 'bg-emerald-500', icon: ChefHat, label: 'Diet & Food' },
                  waste: { color: 'bg-rose-500', icon: Trash2, label: 'Waste Index' }
                };
                
                const currentMeta = meta[category] || { color: 'bg-brand-500', icon: Leaf, label: category };
                const Icon = currentMeta.icon;
                
                return (
                  <div key={category} className="rounded-lg bg-dark-card border border-dark-border p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                      <span className="uppercase tracking-wider flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-gray-300" />
                        {currentMeta.label}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white">{formatCarbon(amount)}</p>
                    <div className="w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${currentMeta.color}`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Annualized impact share
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: ACTIONS & BADGES -------------------- */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full animate-fadeIn">
          {/* Gemini Weekly Plan */}
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-brand-500" />
                  AI Generated Weekly Plan
                </h2>
                {activePlan && (
                  <span className="text-xs bg-brand-950/40 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                )}
              </div>

              {planError && (
                <div className="mb-4 rounded-md bg-rose-950/50 border border-rose-500/30 p-3 text-xs text-rose-400">
                  {planError}
                </div>
              )}

              {!activePlan ? (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <Brain className="h-10 w-10 text-gray-500 mb-3" />
                  <p className="text-sm text-gray-400 mb-4 max-w-sm">
                    Let Gemini analyze your {formatCarbon(latestFootprint.totalEmissions)} yearly footprint and design a modular 4-week task plan.
                  </p>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {generatingPlan ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Analyzing Lifestyle...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate Action Plan</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {activePlan.weeks.map((week) => (
                    <div key={week.weekNumber} className="border border-dark-border bg-dark-card/50 rounded-lg p-3">
                      <h3 className="text-xs font-bold text-brand-500 mb-2 uppercase tracking-wide">
                        Week {week.weekNumber}
                      </h3>
                      <div className="flex flex-col gap-2">
                        {week.tasks.map((task) => {
                          const isDone = task.completed;
                          return (
                            <button
                              key={task.id}
                              onClick={() => toggleTaskCompletion(week.weekNumber, task.id, !isDone)}
                              className="flex items-start gap-2.5 text-left w-full hover:bg-dark-border/20 p-1.5 rounded transition-colors"
                            >
                              {isDone ? (
                                <CheckSquare className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                              )}
                              <div className="text-xs">
                                <p className={`font-semibold ${isDone ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                  {task.action}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                                  <span>Offset: -{task.expectedSavings} kg CO₂e</span>
                                  <span>•</span>
                                  <span className={`font-medium ${
                                    task.difficulty === 'Easy' ? 'text-emerald-500' :
                                    task.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                                  }`}>
                                    {task.difficulty}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activePlan && (
              <div className="mt-4 border-t border-dark-border/40 pt-4 text-center">
                <button
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                  className="text-xs font-semibold text-gray-400 hover:text-brand-500 transition-colors flex items-center gap-1 mx-auto"
                >
                  {generatingPlan ? 'Regenerating...' : 'Request New AI Plan'}
                </button>
              </div>
            )}
          </div>

          {/* Gamified Achievements Badge Grid */}
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white border-b border-dark-border pb-3 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-500" />
              Achievements Unlocked
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {BADGES.map((badge) => {
                const unlocked = achievements.some((a) => a.badgeId === badge.id && a.progress >= 100);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-lg border p-3 flex flex-col items-center text-center transition-all ${
                      unlocked
                        ? 'border-brand-500/30 bg-brand-950/20 text-white shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                        : 'border-dark-border bg-dark-card/50 text-gray-500'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border mb-2 ${
                      unlocked 
                        ? 'bg-brand-950/40 border-brand-500/40 text-brand-500'
                        : 'bg-dark-border border-dark-border text-gray-600'
                    }`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold block">{badge.name}</span>
                    <span className="text-[10px] text-gray-400 mt-1 leading-normal">
                      {badge.description}
                    </span>
                    <span className="text-[9px] text-gray-500 mt-1 bg-dark-bg/85 px-1.5 py-0.5 rounded border border-dark-border/40 font-mono">
                      {unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
