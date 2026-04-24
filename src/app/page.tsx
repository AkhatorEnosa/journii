'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Show, SignUpButton } from '@clerk/nextjs';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Calendar, 
  BarChart3, 
  Target, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Clock
} from 'lucide-react';
import Features from './sections/Features';
import { Hero } from './sections/Hero';

const stats = [
  { value: '10K+', label: 'Active Traders' },
  { value: '1M+', label: 'Trades Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

const benefits = [
  {
    icon: TrendingUp,
    title: 'Improve Performance',
    description: 'Identify winning patterns and eliminate costly mistakes through data-driven insights.',
  },
  {
    icon: Target,
    title: 'Stay Disciplined',
    description: 'Track your adherence to trading rules and maintain consistency in your approach.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Gain insights into win rates, risk-reward ratios, and performance across timeframes.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Automated trade import and analysis lets you focus on trading, not data entry.',
  },
];

const testimonials = [
  {
    content: "TradrJourney transformed my trading. I can finally see exactly where I'm making money and where I'm losing it.",
    author: 'Sarah Chen',
    role: 'Day Trader',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
  {
    content: "The analytics are incredible. I discovered I was overtrading during lunch hours - fixing that alone improved my returns by 15%.",
    author: 'Michael Rodriguez',
    role: 'Swing Trader',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  },
  {
    content: "Finally, a journal that understands what traders actually need. The pattern recognition features are game-changing.",
    author: 'Emma Thompson',
    role: 'Options Trader',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  },
];

const faqs = [
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level 256-bit encryption and never store your broker credentials. Your data is backed up daily and you can export everything at any time.',
  },
  {
    question: 'Can I use this for multiple accounts?',
    answer: 'Yes! Track unlimited accounts. View consolidated performance or analyze each account separately.',
  },
  {
    question: 'Do you offer a free trial?',
    // answer: 'Yes, we offer a 7-day free trial of our Pro plan. No credit card required. You can also get started with our free plan forever.',
    answer: 'Yes, it is free for use. No credit card required. You can also get started with our free plan forever.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Stats Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Why Successful Traders Journal
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Consistent journaling is the #1 habit of profitable traders. Here's how TradrJourney helps you build that habit.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{benefit.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Loved by Traders Worldwide
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of traders who have transformed their performance with TradrJourney.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="font-semibold text-foreground">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about getting started with TradrJourney.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of traders who are already tracking, analyzing, and improving their performance with TradrJourney.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </Show>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}