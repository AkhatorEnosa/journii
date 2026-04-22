import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <ClerkProvider appearance={{
          baseTheme: undefined,
          variables: { 
            colorPrimary: 'oklch(0.488 0.243 264.376)', // sidebar-primary (purple/blue accent)
            colorBackground: 'oklch(0.205 0 0)', // card
            colorInputBackground: 'oklch(0.325 0 0)', // input
            colorText: 'oklch(0.985 0 0)', // primary-foreground
            colorTextSecondary: 'oklch(0.708 0 0)', // muted-foreground
            colorAlphaShade: 'oklch(0.488 0.243 264.376)', // sidebar-primary
            colorBorder: 'oklch(0.275 0 0)', // border
            borderRadius: '0.5rem',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          },
          elements: {
            card: 'bg-card border-border',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'bg-input border-border text-foreground placeholder:text-muted-foreground',
            formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
            formFieldInputShowAction: 'text-primary hover:text-primary/80',
            identityPreviewEditButton: 'text-primary hover:text-primary/80',
            navbarButton: 'text-foreground hover:text-primary',
            profilePage: 'bg-card',
            userButtonPopoverCard: 'bg-card border-border',
            userButtonPopoverActionButton: 'text-foreground hover:bg-accent hover:text-accent-foreground',
            userButtonPopoverFooter: 'text-muted-foreground',
            userButtonPopoverActionButtonText: 'text-foreground',
            userButtonPopoverActionButtonSVG: 'text-foreground',
            userButtonTriggerIcon: 'text-foreground',
            footerActionLink: 'text-primary hover:text-primary/80',
            footerActionText: 'text-muted-foreground',
            socialButtonsBlockButton: 'bg-secondary border-border text-secondary-foreground hover:bg-secondary/90',
            socialButtonsBlockButtonText: 'text-secondary-foreground',
            socialButtonsIconButton: 'bg-secondary border-border hover:bg-secondary/90',
            otpCodeFieldInput: 'bg-input border-border text-foreground',
            formResendCodeLink: 'text-primary hover:text-primary/80',
            formFieldLabelShowPassword: 'text-muted-foreground',
            formFieldAction: 'text-muted-foreground hover:text-foreground',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            modalBackdrop: 'bg-background/80',
            modalBack: 'text-primary hover:text-primary/80',
            modalCloseButton: 'text-muted-foreground hover:text-foreground',
          }
        }}>
          <TooltipProvider>
            {/* Header */}
            <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-foreground">Journii</span>
                </div>
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