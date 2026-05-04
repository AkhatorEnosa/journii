'use client';

import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { Menu, X, Target, BarChart3, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/app/logo.png';

// Navigation links configuration
const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/goals', label: 'Goals', icon: Target },
] as const;

type NavLink = typeof NAV_LINKS[number];

// Desktop Navigation Component
function DesktopNav({ pathname }: { pathname: string }) {
  const getLinkClassName = (path: string) => {
    const isActive = pathname === path;
    return `transition-colors flex items-center gap-2 ${
      isActive 
        ? 'text-foreground font-medium' 
        : 'text-muted-foreground hover:text-foreground'
    }`;
  };

  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
      {NAV_LINKS.map((link) => {
        const IconComponent = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={getLinkClassName(link.href)}
          >
            <IconComponent className="w-4 h-4" />
            {link.label}
          </Link>
        );
      })}
      <ThemeToggle />
      <UserButton />
    </nav>
  );
}

// Mobile Menu Content Component
function MobileMenuContent({ 
  onClose, 
  pathname 
}: { 
  onClose: () => void;
  pathname: string;
}) {
  const getLinkClassName = (path: string) => {
    const isActive = pathname === path;
    return `text-sm flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${
      isActive
        ? 'text-foreground font-medium bg-accent'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    }`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-lg font-semibold text-foreground">Menu</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col p-4 space-y-1" aria-label="Mobile navigation">
      {NAV_LINKS.map((link) => {
        const IconComponent = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={getLinkClassName(link.href)}
            onClick={onClose}
          >
            <IconComponent className="w-4 h-4" />
            {link.label}
          </Link>
        );
      })}
      </nav>

      {/* User Section */}
      <div className="flex justify-between mt-auto p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-muted-foreground">Account</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

// Mobile Menu Button Component
function MobileMenuButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="md:hidden relative z-60 p-2 text-foreground hover:bg-accent rounded-md transition-colors duration-200"
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <X className="size-6" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Menu className="size-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

const DashboardHeader = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node)
    ) {
      setMobileMenuOpen(false);
    }
  }, []);

  // Handle Escape key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [mobileMenuOpen]);

  // Manage body scroll and event listeners
  useEffect(() => {
    if (mobileMenuOpen) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Add event listeners
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen, handleClickOutside, handleKeyDown]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group"
            aria-label="TradrJourney Home"
          >
            <img
              src={Logo.src}
              alt="TradrJourney Logo"
              className="w-16 h-auto transition-all duration-300 dark:invert opacity-95 group-hover:opacity-100"
            />
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav pathname={pathname} />

          {/* Mobile Menu Button */}
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
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
              className="fixed inset-0 bg-background/50 backdrop-blur-sm z-55 md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Slide-out menu */}
            <motion.aside
              id="mobile-menu"
              ref={mobileMenuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-background border-l border-border z-60 md:hidden shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <MobileMenuContent onClose={closeMobileMenu} pathname={pathname} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default DashboardHeader;