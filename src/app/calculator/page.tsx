'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarbonStore } from '../../store/useCarbonStore';
import { CalculatorInputs } from '../../types';
import { CalculatorSchema } from '../../utils/validation';
import AuthRoute from '../../components/AuthRoute';
import { Leaf, Car, Zap, ChefHat, Trash2, ArrowLeft, ArrowRight, Save, Info } from 'lucide-react';

const INITIAL_INPUTS: CalculatorInputs = {
  carMileage: 8000,
  carEfficiency: 25,
  flightsShort: 2,
  flightsLong: 0,
  publicTransportHours: 5,
  electricityBill: 120,
  gasBill: 50,
  meatDays: 4,
  dairyDays: 5,
  recyclingRate: 40,
};

export default function CalculatorPage() {
  return (
    <AuthRoute>
      <CalculatorForm />
    </AuthRoute>
  );
}

function CalculatorForm() {
  const router = useRouter();
  const { saveFootprint, dataLoading } = useCarbonStore();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const stepsInfo = [
    { title: 'Transport', icon: Car, desc: 'Vehicle use, flying, and transit' },
    { title: 'Energy', icon: Zap, desc: 'Electricity and gas consumption' },
    { title: 'Dietary', icon: ChefHat, desc: 'Meat and dairy diet choices' },
    { title: 'Waste', icon: Trash2, desc: 'Trash output and recycling rate' },
  ];

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    setInputs((prev) => ({
      ...prev,
      [field]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const handleNext = () => {
    // Perform partial step validation using Zod
    let fieldsToValidate: (keyof CalculatorInputs)[] = [];
    if (step === 1) {
      fieldsToValidate = ['carMileage', 'carEfficiency', 'flightsShort', 'flightsLong', 'publicTransportHours'];
    } else if (step === 2) {
      fieldsToValidate = ['electricityBill', 'gasBill'];
    } else if (step === 3) {
      fieldsToValidate = ['meatDays', 'dairyDays'];
    }

    const stepInputs: Record<string, number> = {};
    fieldsToValidate.forEach((f) => {
      stepInputs[f] = inputs[f];
    });

    // Make a schema subset for validation
    const partialSchema = CalculatorSchema.pick(
      fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {} as Record<string, boolean>) as unknown as Parameters<typeof CalculatorSchema.pick>[0]
    );

    const result = partialSchema.safeParse(stepInputs);
    if (!result.success) {
      const stepErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          stepErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // Full validation
    const result = CalculatorSchema.safeParse(inputs);
    if (!result.success) {
      const allErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          allErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(allErrors);
      return;
    }

    try {
      await saveFootprint(inputs);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to submit calculation.';
      setSubmitError(errMsg);
    }
  };

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Leaf className="h-7 w-7 text-brand-500" />
          Carbon Footprint Calculator
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Quantify your annual CO₂ greenhouse gas emissions based on international baseline multipliers.
        </p>
      </div>

      {/* Progress Steps Indicators */}
      <div 
        className="grid grid-cols-4 border border-dark-border bg-dark-card rounded-xl overflow-hidden text-center divide-x divide-dark-border text-xs md:text-sm"
        role="progressbar"
        aria-label="Calculator progress"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={4}
      >
        {stepsInfo.map((item, index) => {
          const Icon = item.icon;
          const stepNum = index + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          
          return (
            <div
              key={item.title}
              className={`p-3 md:p-4 flex flex-col items-center justify-center gap-1.5 transition-colors ${
                isActive ? 'bg-brand-950/30 text-brand-500' : isCompleted ? 'text-emerald-600' : 'text-gray-500'
              }`}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${stepNum} of 4: ${item.title}${isCompleted ? ' (Completed)' : isActive ? ' (Active)' : ''}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold">{item.title}</span>
            </div>
          );
        })}
      </div>

      {/* Main Calculator Form */}
      <div className="glass-panel border border-dark-border rounded-2xl p-6 md:p-8 shadow-2xl relative">
        {submitError && (
          <div className="mb-6 rounded-lg bg-rose-950/40 border border-rose-500/30 p-4 text-sm text-rose-400" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Transport */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="border-b border-dark-border pb-3">
                  <h2 className="text-xl font-bold text-white">Transportation Audits</h2>
                  <p className="text-xs text-gray-400">Assess flights, vehicle miles, and public transit schedules.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="carMileage">
                      Annual Car Mileage (Miles)
                    </label>
                    <input
                      id="carMileage"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.carMileage === 0 ? '' : inputs.carMileage}
                      onChange={(e) => handleInputChange('carMileage', e.target.value)}
                      aria-invalid={!!errors.carMileage}
                      aria-describedby={errors.carMileage ? 'carMileage-error' : undefined}
                    />
                    {errors.carMileage && <span id="carMileage-error" className="mt-1 text-xs text-rose-400">{errors.carMileage}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="carEfficiency">
                      Car Fuel Efficiency (MPG)
                    </label>
                    <input
                      id="carEfficiency"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.carEfficiency === 0 ? '' : inputs.carEfficiency}
                      onChange={(e) => handleInputChange('carEfficiency', e.target.value)}
                      aria-invalid={!!errors.carEfficiency}
                      aria-describedby={errors.carEfficiency ? 'carEfficiency-error' : undefined}
                    />
                    {errors.carEfficiency && <span id="carEfficiency-error" className="mt-1 text-xs text-rose-400">{errors.carEfficiency}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="flightsShort">
                      Short-haul Flights per Year (&lt; 3 hours)
                    </label>
                    <input
                      id="flightsShort"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.flightsShort === 0 ? '' : inputs.flightsShort}
                      onChange={(e) => handleInputChange('flightsShort', e.target.value)}
                      aria-invalid={!!errors.flightsShort}
                      aria-describedby={errors.flightsShort ? 'flightsShort-error' : undefined}
                    />
                    {errors.flightsShort && <span id="flightsShort-error" className="mt-1 text-xs text-rose-400">{errors.flightsShort}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="flightsLong">
                      Long-haul Flights per Year (&gt; 3 hours)
                    </label>
                    <input
                      id="flightsLong"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.flightsLong === 0 ? '' : inputs.flightsLong}
                      onChange={(e) => handleInputChange('flightsLong', e.target.value)}
                      aria-invalid={!!errors.flightsLong}
                      aria-describedby={errors.flightsLong ? 'flightsLong-error' : undefined}
                    />
                    {errors.flightsLong && <span id="flightsLong-error" className="mt-1 text-xs text-rose-400">{errors.flightsLong}</span>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="publicTransportHours">
                      Weekly Public Transit Hours (Train, Bus, Subway)
                    </label>
                    <input
                      id="publicTransportHours"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.publicTransportHours === 0 ? '' : inputs.publicTransportHours}
                      onChange={(e) => handleInputChange('publicTransportHours', e.target.value)}
                      aria-invalid={!!errors.publicTransportHours}
                      aria-describedby={errors.publicTransportHours ? 'publicTransportHours-error' : undefined}
                    />
                    {errors.publicTransportHours && <span id="publicTransportHours-error" className="mt-1 text-xs text-rose-400">{errors.publicTransportHours}</span>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Energy */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="border-b border-dark-border pb-3">
                  <h2 className="text-xl font-bold text-white">Household Utility Energy</h2>
                  <p className="text-xs text-gray-400">Specify home electricity and natural gas billing rates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="electricityBill">
                      Average Monthly Electricity Bill ($)
                    </label>
                    <input
                      id="electricityBill"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.electricityBill === 0 ? '' : inputs.electricityBill}
                      onChange={(e) => handleInputChange('electricityBill', e.target.value)}
                      aria-invalid={!!errors.electricityBill}
                      aria-describedby={errors.electricityBill ? 'electricityBill-error' : undefined}
                    />
                    {errors.electricityBill && <span id="electricityBill-error" className="mt-1 text-xs text-rose-400">{errors.electricityBill}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="gasBill">
                      Average Monthly Gas Bill ($)
                    </label>
                    <input
                      id="gasBill"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.gasBill === 0 ? '' : inputs.gasBill}
                      onChange={(e) => handleInputChange('gasBill', e.target.value)}
                      aria-invalid={!!errors.gasBill}
                      aria-describedby={errors.gasBill ? 'gasBill-error' : undefined}
                    />
                    {errors.gasBill && <span id="gasBill-error" className="mt-1 text-xs text-rose-400">{errors.gasBill}</span>}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/40 p-4 border border-dark-border/60">
                  <Info className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-400 leading-relaxed">
                    CarbonWise calculates fuel equivalents by applying regional utility grid emissions coefficients. Heavy gas heating and non-renewable electricity grids dramatically impact scores.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Food & Diet */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="border-b border-dark-border pb-3">
                  <h2 className="text-xl font-bold text-white">Food & Dietary Choices</h2>
                  <p className="text-xs text-gray-400">Assess high-emissions food groups (meat/dairy) weekly frequencies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="meatDays">
                      Days Eating Meat per Week (Beef, Pork, Chicken)
                    </label>
                    <input
                      id="meatDays"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.meatDays === 0 ? '' : inputs.meatDays}
                      onChange={(e) => handleInputChange('meatDays', e.target.value)}
                      aria-invalid={!!errors.meatDays}
                      aria-describedby={errors.meatDays ? 'meatDays-error' : undefined}
                    />
                    {errors.meatDays && <span id="meatDays-error" className="mt-1 text-xs text-rose-400">{errors.meatDays}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="dairyDays">
                      Days Eating Dairy per Week (Cheese, Milk, Yogurt)
                    </label>
                    <input
                      id="dairyDays"
                      type="number"
                      className="w-full rounded-lg border border-dark-border bg-dark-card py-2 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                      value={inputs.dairyDays === 0 ? '' : inputs.dairyDays}
                      onChange={(e) => handleInputChange('dairyDays', e.target.value)}
                      aria-invalid={!!errors.dairyDays}
                      aria-describedby={errors.dairyDays ? 'dairyDays-error' : undefined}
                    />
                    {errors.dairyDays && <span id="dairyDays-error" className="mt-1 text-xs text-rose-400">{errors.dairyDays}</span>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Waste */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="border-b border-dark-border pb-3">
                  <h2 className="text-xl font-bold text-white">Waste & Recycling Index</h2>
                  <p className="text-xs text-gray-400">Quantify solid waste offsets through recycling efforts.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="recyclingRate">
                    Recycling Rate Percentage (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="recyclingRate"
                      type="range"
                      min="0"
                      max="100"
                      className="w-full accent-brand-500 bg-dark-card h-2 rounded-lg cursor-pointer border border-dark-border"
                      value={inputs.recyclingRate}
                      onChange={(e) => handleInputChange('recyclingRate', e.target.value)}
                      aria-invalid={!!errors.recyclingRate}
                      aria-describedby={errors.recyclingRate ? 'recyclingRate-error' : undefined}
                    />
                    <span className="w-12 text-sm font-bold text-brand-500 text-right">{inputs.recyclingRate}%</span>
                  </div>
                  {errors.recyclingRate && <span id="recyclingRate-error" className="mt-1 text-xs text-rose-400">{errors.recyclingRate}</span>}
                </div>

                <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/40 p-4 border border-dark-border/60">
                  <Trash2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-400 leading-relaxed">
                    By sorting packaging, composting organic matter, and avoiding single-use plastics, you offset landfill methane emissions. A higher recycling rate directly subtracts up to 500 kg CO2e/year from your final footprint.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Action Controls */}
          <div className="flex items-center justify-between border-t border-dark-border/50 pt-6 mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 rounded-lg border border-dark-border bg-dark-card px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500"
              >
                <span>Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={dataLoading}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{dataLoading ? 'Saving Calculations...' : 'Submit & Analyze'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
