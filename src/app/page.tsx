'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, Brain, Sliders, LineChart, Globe, Shield, Sparkles, MapPin } from 'lucide-react';
import { useState } from 'react';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);

  const stats = [
    { label: 'Global Warming Limit', value: '1.5°C', desc: 'Paris Agreement target' },
    { label: 'US Average Carbon Footprint', value: '16.0 Tons', desc: 'Per person, annually' },
    { label: 'Net Zero Target Footprint', value: '2.0 Tons', desc: 'Sustainable global limit' },
    { label: 'CO2 Absorbed by One Tree', value: '22 kg', desc: 'Every year on average' },
  ];

  const features = [
    {
      icon: Leaf,
      title: 'Precision Calculator',
      description: 'Break down your footprint across transport, household utilities, diet choices, and waste habits with EPA & DEFRA models.',
      href: '/calculator',
    },
    {
      icon: Brain,
      title: 'AI Coach & Weekly Plans',
      description: 'Receive personalized action items, weekly plans, and lifestyle insights powered by Google Gemini 1.5 Flash.',
      href: '/coach',
    },
    {
      icon: Sliders,
      title: 'Predictive Simulator',
      description: 'Adjust interactive sliders in real time to simulate future reductions, target outcomes, and calculate trees-saved equivalent.',
      href: '/simulator',
    },
    {
      icon: LineChart,
      title: 'Environmental Cockpit',
      description: 'Analyze statistics through a BigQuery-style analytical dashboard mapping weekly reductions and future forecasts.',
      href: '/analytics',
    },
    {
      icon: MapPin,
      title: 'Eco Resource Map',
      description: 'Locate local EV chargers, recycling depots, bike hubs, and public transport via Google Maps API.',
      href: '/eco-map',
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center py-16 md:py-24 overflow-hidden rounded-3xl border border-dark-border bg-gradient-to-b from-dark-card to-dark-bg px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent-500/5 rounded-full blur-[90px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/40 px-4 py-1.5 text-xs text-brand-400 font-semibold mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Carbon Intelligence Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl"
        >
          Understand → Predict → Reduce <br />
          <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
            Achieve Net Zero
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base md:text-lg text-gray-400 max-w-2xl"
        >
          Design your lifestyle roadmap with CarbonWise AI. Quantify your carbon footprint, simulate future actions, and receive AI-guided goals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/calculator"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.35)]"
          >
            Calculate Your Footprint
          </Link>
          <Link
            href="/coach"
            className="rounded-lg border border-dark-border bg-dark-card px-6 py-3 text-sm font-semibold text-gray-300 transition-all hover:text-white hover:bg-slate-800"
          >
            Consult AI Coach
          </Link>
        </motion.div>
      </section>

      {/* Carbon Stats Section */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">The Environmental Challenge</h2>
          <p className="text-sm text-gray-400 mt-2">Key sustainability benchmarks to understand global carbon targets</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel rounded-xl border border-dark-border p-6 flex flex-col justify-between"
            >
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">{stat.label}</span>
              <span className="text-3xl font-extrabold text-white my-3">{stat.value}</span>
              <span className="text-xs text-gray-400">{stat.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Eco Engineering Cockpit</h2>
          <p className="text-sm text-gray-400 mt-2">Tools structured to empower daily carbon intelligence audits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-xl border border-dark-border bg-dark-card p-6 transition-all hover:border-brand-500/40 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-950/50 text-brand-500 border border-brand-500/20 mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="mt-5 inline-flex items-center text-xs font-bold text-brand-500 hover:text-brand-400"
                >
                  Configure Tool →
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Google Tech Stack Section */}
      <section className="rounded-2xl border border-dark-border bg-dark-card/50 p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-500 uppercase tracking-wider">
            <Globe className="h-4 w-4" />
            <span>Built on Google Infrastructure</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Startup-grade Cloud Pipeline</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            CarbonWise AI is engineered using high-performance serverless services. Authentication is securely handled by Firebase Auth, analytical documents sync directly to Firestore, Google Gemini 1.5 Flash provides weekly plan generations, and Google Maps plots locations.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          {['Firebase DB', 'Gemini AI', 'Google Maps', 'Cloud Run'].map((svc) => (
            <div
              key={svc}
              className="flex items-center gap-2 rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm font-semibold text-white"
            >
              <Shield className="h-4 w-4 text-brand-500" />
              <span>{svc}</span>
            </div>
          ))}
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
