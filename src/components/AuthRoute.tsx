'use client';

import React, { useState } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { Lock, Loader2 } from 'lucide-react';
import AuthModal from './AuthModal';

interface AuthRouteProps {
  children: React.ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const { currentUser, authLoading } = useCarbonStore();
  const [authOpen, setAuthOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-300">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm font-medium">Securing connection...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto my-12 max-w-2xl px-4 text-center">
        <div className="glass-panel flex flex-col items-center rounded-2xl border border-dark-border p-8 md:p-12 shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-950/40 text-brand-500 border border-brand-500/20 mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Secure Carbon Intelligence</h1>
          <p className="text-sm text-gray-400 mb-6 max-w-md">
            To view personalized carbon predictions, track sustainable habits, or chat with the AI Carbon Coach, please sign in.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            Sign In to Platform
          </button>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return <>{children}</>;
}
