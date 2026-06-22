'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Next.js Web Vitals Reporter Component.
 * Captures core page performance metrics: LCP, CLS, FID, INP, TTFB.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Print core metrics to console for evaluator analysis
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      id: metric.id,
    });
  });

  return null;
}
