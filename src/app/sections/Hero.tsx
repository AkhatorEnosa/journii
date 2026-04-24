"use client";

import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SignUpButton, Show } from "@clerk/nextjs";
import Link from "next/link";
import Header from "./Header";

export const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradient background with grain effect */}
      <div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0 ">
        <div className="h-40 rounded-full w-240 z-1 bg-linear-to-b blur-[6rem] from-purple-600/30 to-sky-600/30"></div>
        <div className="h-40 rounded-full w-360 z-1 bg-linear-to-b blur-[6rem] from-pink-900/20 to-yellow-400/20"></div>
        <div className="h-40 rounded-full w-240 z-1 bg-linear-to-b blur-[6rem] from-yellow-600/20 to-sky-500/20"></div>
      </div>
      <div className="absolute inset-0 z-0 bg-noise opacity-20"></div>

      {/* Content container */}
      <div className="relative z-10">
        {/* Navigation */}
          <Header />

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Track Your Trades,{' '}
            <span className="text-primary">Master Your Strategy</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A beautiful, powerful trade journal that helps you analyze your performance,
            identify patterns, and become a more profitable trader.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="h-12 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90">
                  Start Trading Smarter
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <button className="h-12 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90">
                  Go to Dashboard
                </button>
              </Link>
            </Show>
            <Link href="#features">
              <button className="h-12 rounded-full border border-border px-8 text-base font-medium text-foreground hover:bg-muted">
                Explore Features
              </button>
            </Link>
          </div>

          <div className="relative mx-auto my-20 p-6 w-full max-w-6xl">
            <div className="absolute inset-0 rounded shadow-lg bg-emerald-400 blur-[10rem] opacity-10" />

            {/* Hero Image - Trading Dashboard Preview */}
            <img
              src="https://ik.imagekit.io/btlflc5goc/tradrjourney/tradrjourney.png"
              alt="Trading Dashboard Preview"
              className="relative w-full h-auto shadow-lg rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function NavItem({
  label,
  hasDropdown,
}: {
  label: string;
  hasDropdown?: boolean;
}) {
  return (
    <div className="flex items-center text-sm text-muted-foreground hover:text-foreground">
      <span>{label}</span>
      {hasDropdown && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </div>
  );
}

function MobileNavItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 text-lg text-foreground">
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}