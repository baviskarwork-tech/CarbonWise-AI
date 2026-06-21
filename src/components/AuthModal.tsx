'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCarbonStore } from '../store/useCarbonStore';
import { X, Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { UserRegisterSchema, UserLoginSchema } from '../utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, authLoading, authError } = useCarbonStore();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setSubmitError('');

    try {
      if (isSignUp) {
        // Validate with Zod
        const parseResult = UserRegisterSchema.safeParse({ email, password, displayName });
        if (!parseResult.success) {
          const errors: Record<string, string> = {};
          parseResult.error.issues.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0].toString()] = err.message;
            }
          });
          setValidationErrors(errors);
          return;
        }

        await registerWithEmail(email, password, displayName);
      } else {
        // Validate with Zod
        const parseResult = UserLoginSchema.safeParse({ email, password });
        if (!parseResult.success) {
          const errors: Record<string, string> = {};
          parseResult.error.issues.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0].toString()] = err.message;
            }
          });
          setValidationErrors(errors);
          return;
        }

        await loginWithEmail(email, password);
      }
      
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Authentication failed. Please check credentials.';
      setSubmitError(errMsg);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setSubmitError(errMsg);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-md rounded-xl border border-dark-border bg-dark-bg p-6 shadow-2xl animate-fade-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close Authentication dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 id="auth-modal-title" className="text-2xl font-bold text-white">
            {isSignUp ? 'Join CarbonWise AI' : 'Welcome Back'}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {isSignUp ? 'Start tracking your path to Net Zero' : 'Access your personalized insights'}
          </p>
        </div>

        {/* Global Error Alerts */}
        {(submitError || authError) && (
          <div className="mb-4 rounded-md bg-rose-950/50 border border-rose-500/30 p-3 text-xs text-rose-400" role="alert">
            {submitError || authError}
          </div>
        )}

        {/* Google Login Trigger */}
        <button
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-dark-border bg-dark-card py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 15.01 1 12 1 7.35 1 3.39 3.67 1.39 7.56l3.86 3C6.18 7.56 8.84 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.88c2.18-2.01 3.7-4.99 3.7-8.7z"
            />
            <path
              fill="#FBBC05"
              d="M5.25 10.56c-.26-.81-.41-1.68-.41-2.56s.15-1.75.41-2.56l-3.86-3C.51 4.54 0 6.21 0 8s.51 3.46 1.39 5.56l3.86-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.72-2.88c-1.11.75-2.53 1.19-4.24 1.19-3.16 0-5.82-2.52-6.75-5.52l-3.86 3C3.39 20.33 7.35 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="my-5 flex items-center justify-between">
          <span className="w-1/5 border-b border-dark-border"></span>
          <span className="text-xs uppercase text-gray-500">Or email login</span>
          <span className="w-1/5 border-b border-dark-border"></span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="auth-name">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-dark-border bg-dark-card py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              {validationErrors.displayName && (
                <span className="mt-1 text-xs text-rose-400">{validationErrors.displayName}</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="auth-email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-dark-border bg-dark-card py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {validationErrors.email && (
              <span className="mt-1 text-xs text-rose-400">{validationErrors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="auth-password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-dark-border bg-dark-card py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {validationErrors.password && (
              <span className="mt-1 text-xs text-rose-400">{validationErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 disabled:opacity-50"
          >
            {authLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle between SignUp and Login */}
        <div className="mt-4 text-center text-xs">
          <span className="text-gray-400">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setValidationErrors({});
              setSubmitError('');
            }}
            className="font-semibold text-brand-500 hover:underline focus:outline-none"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {/* Simulation Indicator */}
        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-dark-border/40 pt-4 text-center text-[10px] text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Secured with Sandbox-ready Session Handling</span>
        </div>
      </div>
    </div>
  );
}
