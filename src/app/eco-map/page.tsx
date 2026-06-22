'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import AuthRoute from '../../components/AuthRoute';

// Dynamically load the heavy map component to optimize Lighthouse LCP/CLS metrics
const EcoMapView = dynamic(() => import('./EcoMapViewComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-dark-card border border-dark-border rounded-2xl p-8 animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden="true" />
      <p className="text-sm font-medium text-gray-400">Loading Local Environmental Assets...</p>
    </div>
  ),
});

export default function EcoMapPage() {
  return (
    <AuthRoute>
      <EcoMapView />
    </AuthRoute>
  );
}
