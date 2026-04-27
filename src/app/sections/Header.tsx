'use client';

import { Button } from '@/components/ui/button';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { TrendingUp, Menu, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // disable scrollbar when mobile Menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [mobileMenuOpen])

  return (
    <header className="border-b border-border backdrop-blur-sm z-50 sticky top-0">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="size-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">TradrJourney</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="default" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
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
                    href="#features"
                    className="text-lg text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="text-lg text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                </nav>

                {/* Auth buttons */}
                <div className="mt-auto p-4 border-t border-border space-y-3">
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button
                        className="w-full text-left text-muted-foreground hover:text-foreground transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <div className="flex items-center gap-3 py-2">
                      <UserButton />
                      <span className="text-foreground">Account</span>
                    </div>
                  </Show>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;