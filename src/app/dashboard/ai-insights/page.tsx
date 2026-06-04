'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AIInsightsDashboard } from '@/components/ai-insights/AIInsightsDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { AIAnalysisResponse, TradeMetrics } from '@/lib/ai-analysis';

export default function AIInsightsPage() {
  const { user } = useUser();
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [metrics, setMetrics] = useState<TradeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  const fetchAnalysis = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setMetrics(data.metrics);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Auto-fetch analysis on mount if user is logged in
  useEffect(() => {
    if (user?.id) {
      fetchAnalysis();
    }
  }, [user?.id, fetchAnalysis]);

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md mx-auto shadow-xl border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Please sign in</CardTitle>
                <CardDescription className="text-base">
                  You need to be signed in to view AI-powered trading insights
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {error ? (
        <div className="container mx-auto py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md mx-auto shadow-xl border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-destructive">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  Analysis Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button 
                  onClick={fetchAnalysis} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry Analysis
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <AIInsightsDashboard
          analysis={analysis}
          metrics={metrics}
          isLoading={isLoading}
          onRefresh={fetchAnalysis}
          lastUpdated={lastUpdated}
        />
      )}
    </div>
  );
}