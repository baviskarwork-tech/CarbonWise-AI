'use client';

import React, { useState } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import { GoalSchema } from '../../utils/validation';
import { formatCarbon, formatDate, formatPercent } from '../../utils/formatters';
import AuthRoute from '../../components/AuthRoute';
import { Award, Leaf, Target, Clock, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function GoalsPage() {
  return (
    <AuthRoute>
      <GoalsView />
    </AuthRoute>
  );
}

function GoalsView() {
  const { footprints, goals, createGoal } = useCarbonStore();

  const [reductionTarget, setReductionTarget] = useState<10 | 25 | 50>(10);
  const [timeline, setTimeline] = useState<3 | 6 | 12>(6);
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const hasFootprint = footprints.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!hasFootprint) {
      setSubmitError('Please run a footprint calculation before setting targets.');
      return;
    }

    // Validate with Zod
    const parseResult = GoalSchema.safeParse({
      targetReductionPercent: reductionTarget,
      timelineMonths: timeline,
    });

    if (!parseResult.success) {
      setSubmitError('Invalid selection targets.');
      return;
    }

    setSaving(true);
    try {
      await createGoal(reductionTarget, timeline);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to create goal.';
      setSubmitError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Target className="h-7 w-7 text-brand-500" />
          Sustainability Goal Engine
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Establish targeted reduction schedules, track ongoing progress, and meet carbon offsets deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Create Goal Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white border-b border-dark-border pb-3 mb-5">
              Set New Reduction Target
            </h2>

            {submitError && (
              <div className="mb-4 rounded-md bg-rose-950/50 border border-rose-500/30 p-3 text-xs text-rose-400">
                {submitError}
              </div>
            )}

            {!hasFootprint ? (
              <div className="text-center py-6">
                <Leaf className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  You need a baseline footprint calculation before setting carbon goals.
                </p>
                <Link
                  href="/calculator"
                  className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
                >
                  Go to Calculator
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Reduction Goal Percentage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([10, 25, 50] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReductionTarget(val)}
                        className={`rounded-lg py-2.5 text-xs font-semibold border transition-all ${
                          reductionTarget === val
                            ? 'border-brand-500 bg-brand-950/20 text-brand-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                            : 'border-dark-border bg-dark-card text-gray-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {val}% Reduction
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Target Timeframe
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([3, 6, 12] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTimeline(val)}
                        className={`rounded-lg py-2.5 text-xs font-semibold border transition-all ${
                          timeline === val
                            ? 'border-brand-500 bg-brand-950/20 text-brand-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                            : 'border-dark-border bg-dark-card text-gray-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {val} Months
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span>Establish Goal</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Active Goals list */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel border border-dark-border rounded-xl p-6 shadow-lg flex-grow">
            <h2 className="text-lg font-bold text-white border-b border-dark-border pb-3 mb-5">
              Active Reduction Targets
            </h2>

            {goals.length === 0 ? (
              <div className="py-16 text-center">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No active goals are scheduled yet.</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Establish a reduction percentage goal above, and complete weekly action plan tasks to lower your carbon emissions!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {goals.map((goal) => {
                  const isCompleted = goal.isCompleted || goal.progressPercent >= 100;
                  return (
                    <div
                      key={goal.id}
                      className={`rounded-lg border p-5 bg-dark-card/45 flex flex-col gap-4 transition-all ${
                        isCompleted
                          ? 'border-brand-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                          : 'border-dark-border'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                            isCompleted 
                              ? 'bg-brand-950/40 border-brand-500/40 text-brand-500' 
                              : 'bg-dark-border border-dark-border text-gray-400'
                          }`}>
                            {isCompleted ? <Award className="h-4.5 w-4.5 animate-bounce" /> : <Clock className="h-4.5 w-4.5" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white">
                              Reduce emissions by {goal.targetReductionPercent}%
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              <span>Target date: {formatDate(goal.targetDate)}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          isCompleted
                            ? 'bg-brand-950/50 text-brand-400 border-brand-500/20'
                            : 'bg-dark-border text-gray-400 border-dark-border/40'
                        }`}>
                          {isCompleted ? 'Completed' : 'Active'}
                        </span>
                      </div>

                      {/* Carbon stats progress */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="border border-dark-border/30 rounded p-1.5 bg-dark-bg/30">
                          <span className="text-[9px] text-gray-500 uppercase block">Starting</span>
                          <span className="font-semibold text-gray-300">{formatCarbon(goal.startEmissions)}</span>
                        </div>
                        <div className="border border-dark-border/30 rounded p-1.5 bg-dark-bg/30">
                          <span className="text-[9px] text-gray-500 uppercase block">Current</span>
                          <span className="font-semibold text-gray-300">{formatCarbon(goal.currentEmissions)}</span>
                        </div>
                        <div className="border border-dark-border/30 rounded p-1.5 bg-dark-bg/30">
                          <span className="text-[9px] text-gray-500 uppercase block">Target</span>
                          <span className="font-semibold text-brand-400">{formatCarbon(goal.targetEmissions)}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                          <span>Reduction Progress</span>
                          <span className="font-bold text-brand-500 font-mono">
                            {formatPercent(goal.progressPercent)}
                          </span>
                        </div>
                        <div className="w-full bg-dark-border h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, goal.progressPercent))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
