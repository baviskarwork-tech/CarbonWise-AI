'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#070b12] border-t border-dark-border px-4 py-8 md:px-8 text-gray-400">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-brand-500" />
            <span className="text-lg font-bold tracking-tight text-white">
              CarbonWise <span className="text-brand-500">AI</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 text-center md:text-left">
            Understand → Predict → Reduce → Achieve Net Zero
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/calculator" className="hover:text-white transition-colors">Calculator</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/simulator" className="hover:text-white transition-colors">Simulator</Link>
          <Link href="/coach" className="hover:text-white transition-colors">AI Coach</Link>
        </div>

        {/* Info & Accessibility */}
        <div className="flex flex-col items-center md:items-end text-xs text-gray-500 gap-1.5">
          <span>© {new Date().getFullYear()} CarbonWise AI. Built for the Net Zero Mission.</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            WCAG 2.1 AA Compliant & Accessible
          </span>
        </div>
      </div>
    </footer>
  );
}
