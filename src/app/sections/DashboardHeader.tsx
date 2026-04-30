'use client';

import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { TrendingUp, Menu, X, Target, BarChart3, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/app/logo.png';

const DashboardHeader = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getLinkClassName = (path: string) => {
    const isActive = pathname === path;
    return `transition-colors flex items-center gap-2 ${
      isActive 
        ? 'text-foreground font-medium' 
        : 'text-muted-foreground hover:text-foreground'
    }`;
  };
  
  // disable scrollbar when mobile Menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [mobileMenuOpen]);

  return (
    <header className="border-b border-border backdrop-blur-sm z-50 sticky top-0">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img 
            src={Logo.src} 
            alt="TradrJourney Logo" 
            className="w-24 h-auto transition-all duration-300 dark:invert opacity-95" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className={getLinkClassName('/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link 
            href="/analytics" 
            className={getLinkClassName('/analytics')}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
          <Link 
            href="/goals" 
            className={getLinkClassName('/goals')}
          >
            <Target className="w-4 h-4" />
            Goals
          </Link>
          <ThemeToggle />
          <UserButton />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden absolute top-2 right-8 z-100 text-foreground p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="size-6" />
          ) : (
            <Menu className="size-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed h-screen bg-background/50 backdrop-blur-sm inset-0 z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 h-screen pl-5 pb-10 bg-background w-60 max-w-[80vw] border-l border-border z-51 md:hidden shadow-lg"
            >
              <div className="flex flex-col">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="text-lg font-bold text-foreground">Menu</span>
                  <ThemeToggle />
                </div>

                {/* Navigation links */}
                <nav className="flex flex-col p-4 space-y-4">
                  <Link
                    href="/dashboard"
                    className={`text-lg py-2 flex items-center gap-2 ${
                      pathname === '/dashboard'
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground transition-colors'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/analytics"
                    className={`text-lg py-2 flex items-center gap-2 ${
                      pathname === '/analytics'
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground transition-colors'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Link>
                  <Link
                    href="/goals"
                    className={`text-lg py-2 flex items-center gap-2 ${
                      pathname === '/goals'
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground transition-colors'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Target className="w-4 h-4" />
                    Goals
                  </Link>
                </nav>

                {/* User section */}
                <div className="mt-auto p-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <UserButton />
                    <span className="text-foreground">Account</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default DashboardHeader;