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
    <html lang="en" className={`${montserrat.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
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
              <Footer />
            </TooltipProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}