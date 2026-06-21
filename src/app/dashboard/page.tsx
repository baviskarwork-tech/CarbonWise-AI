'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCarbonStore } from '../../store/useCarbonStore';
import AuthRoute from '../../components/AuthRoute';
import { calculateSustainabilityScore, getGradeBadgeColor } from '../../utils/score';
import { formatCarbon, formatDate } from '../../utils/formatters';
import { BADGES } from '../../constants';
import { 
  Award, 
  Leaf, 
  Brain, 
  CalendarCheck, 
  Loader2, 
  CheckSquare, 
  Square,
  Sparkles
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

  const latestFootprint = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  const scoreObj = latestFootprint 
    ? calculateSustainabilityScore(latestFootprint.breakdown)
    : { score: 0, grade: 'Poor' as const, breakdownScores: { transport: 0, energy: 0, food: 0, waste: 0 } };

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

  return (
    <div className="flex flex-col gap-8">
      {/* Dashboard Summary Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Sustainability Dashboard</h1>
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

      {/* Analytics Gauge Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Ring Component */}
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
          <div className="mt-4 border-t border-dark-border/40 pt-4 flex justify-between items-center text-xs">
            <span className="text-gray-400">Target Goal limit</span>
            <span className="font-semibold text-emerald-500">2,000 kg / Year</span>
          </div>
        </div>

        {/* Global Average benchmark card */}
        <div className="glass-panel border border-dark-border rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-2">VS National Baseline</h2>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-extrabold text-white">
                {Math.round((latestFootprint.totalEmissions / 16000) * 100)}%
              </span>
              <span className="text-xs text-gray-400">of baseline</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              National carbon footprint baseline average is 16,000 kg CO₂e / person.
            </p>
          </div>
          <div className="mt-4 border-t border-dark-border/40 pt-4 flex justify-between items-center text-xs">
            <span className="text-gray-400">Net reduction path</span>
            <span className="font-semibold text-brand-400">
              {latestFootprint.totalEmissions <= 16000 ? 'Ahead of baseline' : 'Over baseline'}
            </span>
          </div>
        </div>
      </div>

      {/* Carbon Categories Breakdown */}
      <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-6">Emissions Sector Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {Object.entries(latestFootprint.breakdown).map(([category, amount]) => {
            const pct = Math.round((amount / latestFootprint.totalEmissions) * 100) || 0;
            return (
              <div key={category} className="rounded-lg bg-dark-card border border-dark-border p-4">
                <span className="text-xs font-semibold uppercase text-gray-400 capitalize">{category}</span>
                <p className="text-2xl font-extrabold text-white mt-1.5">{formatCarbon(amount)}</p>
                <div className="mt-2.5 w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-500 h-full rounded-full" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                  <span>Share</span>
                  <span>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Plan & Badge System Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* Gamified Achievements badge grid */}
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
    </div>
  );
}
