'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCarbonStore } from '../store/useCarbonStore';
import { useEffect, useState } from 'react';
import { Leaf, LogOut, Menu, X, User } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout, initAuth } = useCarbonStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Initialize Auth state listener
    const unsub = initAuth();
    return () => unsub();
  }, [initAuth]);

  const navLinks = [
    { name: 'Calculator', href: '/calculator' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Simulator', href: '/simulator' },
    { name: 'AI Coach', href: '/coach' },
    { name: 'Goals', href: '/goals' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Eco Map', href: '/eco-map' },
  ];

  const handleAuthClick = () => {
    if (currentUser) {
      logout();
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-dark-border px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="CarbonWise AI Home">
          <Leaf className="h-6 w-6 text-brand-500 animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-white">
            CarbonWise <span className="text-brand-500">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-500 ${
                  isActive ? 'text-brand-500 border-b-2 border-brand-500 pb-1' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Account / Auth Trigger */}
        <div className="hidden items-center gap-4 lg:flex">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-dark-border px-3 py-1 text-xs text-gray-200">
                <User className="h-3.5 w-3.5 text-brand-500" />
                <span>{currentUser.displayName}</span>
              </div>
              <button
                onClick={handleAuthClick}
                className="flex items-center gap-1 rounded-md bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-400 border border-rose-500/20 transition-all hover:bg-rose-900/40"
                aria-label="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuthClick}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="flex p-1.5 text-gray-300 hover:text-white lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile Navigation"
          className="absolute left-0 top-[60px] w-full bg-dark-bg border-b border-dark-border py-4 px-6 flex flex-col gap-4 lg:hidden animate-fade-in"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium py-1.5 border-b border-dark-border/20 transition-colors ${
                pathname === link.href ? 'text-brand-500' : 'text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            {currentUser ? (
              <>
                <div className="text-sm text-gray-300">Logged in as: <span className="font-semibold text-brand-500">{currentUser.displayName}</span></div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-rose-950/40 py-2.5 text-sm font-semibold text-rose-400 border border-rose-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Auth Popup modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
}
