'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {  TrendingUp, BarChart3, Target,MessageSquare,Clock} from 'lucide-react';
import Features from './sections/Features';
import { Hero } from './sections/Hero';
import Footer from './sections/Footer';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { ScaleIn } from '@/components/animations/ScaleIn';


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
  // {
  //   question: 'How do I import my trades?',
  //   answer: 'You can easily import your trades from popular platforms like MetaTrader, Thinkorswim, and more using our CSV import feature.',
  // },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption to protect your data and never share it with third parties.',
  },
  {
    question: 'Can I use TradrJourney on mobile?',
    answer: 'Yes! Our responsive design ensures you can access your trading journal and analytics on any device.',
  },
  {
    question: 'What if I need help?',
    answer: 'Our support team is here for you. You can reach out via email or live chat for any assistance you need.',
  },
  {
    question: 'Is it free to use?',
    answer: 'We offer a free tier with basic features. For advanced analytics and unlimited trade tracking, we have affordable subscription plans.',
  },
  {
    question: 'Can I export my data?',
    answer: 'For now, no. However, soon you can export your trade data and analytics reports in CSV or PDF format anytime on premium.',
  },
  {
    question: 'Do you have a mobile app?',
    answer: 'Not yet, but we are actively working on developing a mobile app for both iOS and Android. Stay tuned for updates!',
  },
  {
    question: 'Can I share my journal with my mentor?',
    answer: 'Yes! With our premium subscription, you can generate shareable links to your trading journal and analytics reports for mentors or accountability partners.',
  }
]

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
            <FadeInUp>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Why Successful Traders Journal
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Consistent journaling is the #1 habit of profitable traders. Here's how TradrJourney helps you build that habit.
                </p>
              </div>
            </FadeInUp>

            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <FadeInUp key={index} className="w-full">
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors">
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
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <Features />

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto max-w-6xl">
            <FadeInUp>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Loved by Traders Worldwide
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of traders who have transformed their performance with TradrJourney.
                </p>
              </div>
            </FadeInUp>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <ScaleIn key={index} delay={index * 0.1} className="w-full">
                  <Card className="bg-card border-border">
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
                </ScaleIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <FadeInUp>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything you need to know about getting started with TradrJourney.
                </p>
              </div>
            </FadeInUp>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <FadeInUp key={index} className="w-full">
                  <Card className="bg-card border-border">
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
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}