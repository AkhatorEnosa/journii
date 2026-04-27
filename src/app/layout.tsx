import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { shadcn } from '@clerk/ui/themes'
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Footer from "./sections/Footer";
import Header from "./sections/Header";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradrJourney - Trade Journal",
  description: "A beautiful trade journal for tracking your trading performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              theme: shadcn
            }}
          >
            <QueryProvider>
              <TooltipProvider>
                <main className="flex-1 bg-background">
                  {children}
                </main>
              </TooltipProvider>
            </QueryProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}