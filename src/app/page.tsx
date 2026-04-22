'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, TrendingUp, Shield, Zap, Target } from 'lucide-react';
import { Show, SignUpButton } from '@clerk/nextjs';

const features = [
  {
    icon: Calendar,
    title: 'Calendar View',
    description: 'Visualize your trades on a beautiful calendar interface with color-coded PnL indicators.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track your win rate, average PnL, and other key metrics with interactive charts.',
  },
  {
    icon: Target,
    title: 'Trade Tracking',
    description: 'Record and analyze every trade with detailed notes, tags, and custom categories.',
  },
  {
    icon: TrendingUp,
    title: 'PnL Analysis',
    description: 'Monitor your profit and loss over time with real-time calculations and insights.',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Your data is safely stored with Supabase authentication and encryption.',
  },
  {
    icon: Zap,
    title: 'Fast & Responsive',
    description: 'Built with Next.js for lightning-fast performance and smooth interactions.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: ['Up to 100 trades/month', 'Basic analytics', 'Calendar view', 'Export data'],
    buttonText: 'Get Started',
    buttonVariant: 'secondary' as const,
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For serious traders',
    features: ['Unlimited trades', 'Advanced analytics', 'Custom reports', 'API access', 'Priority support'],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary' as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                ✨ Introducing Journii v1.0
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
                Track Your Trades,{' '}
                <span className="text-primary">Master Your Strategy</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A beautiful, powerful trade journal that helps you analyze your performance,
                identify patterns, and become a more profitable trader.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Show when="signed-out">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                      Start Trading Smarter
                    </Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                      Go to Dashboard
                    </Button>
                  </Link>
                </Show>
                <Link href="#features">
                  <Button variant="secondary" size="lg" className="text-lg px-8 py-6">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-card/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed by traders, for traders. Track, analyze, and improve your trading performance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start for free and upgrade when you're ready to take your trading to the next level.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`bg-card border-border ${
                    index === 1 ? 'border-primary/50 shadow-lg shadow-primary/10' : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-foreground">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Show when="signed-out">
                      <SignUpButton mode="modal">
                        <Button
                          variant={plan.buttonVariant === 'primary' ? 'default' : 'secondary'}
                          className="w-full"
                        >
                          {plan.buttonText}
                        </Button>
                      </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                      <Link href="/dashboard">
                        <Button
                          variant={plan.buttonVariant === 'primary' ? 'default' : 'secondary'}
                          className="w-full"
                        >
                          {plan.buttonText}
                        </Button>
                      </Link>
                    </Show>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-linear-to-b from-card to-background">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of traders who are already using Journii to track and improve their performance.
            </p>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                  Get Started for Free
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                  Go to Dashboard
                </Button>
              </Link>
            </Show>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Journii</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Journii. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}