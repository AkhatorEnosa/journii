import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { clerkAppearance } from "@/lib/clerk-appearance";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journii - Trade Journal",
  description: "A beautiful trade journal for tracking your trading performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ClerkProvider appearance={clerkAppearance}>
          <TooltipProvider>
            {/* Header */}
            <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-foreground">Journii</span>
                </Link >
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
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
              </div>
            </header>
            <main className="flex-1 bg-background">
              {children}
            </main>
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}