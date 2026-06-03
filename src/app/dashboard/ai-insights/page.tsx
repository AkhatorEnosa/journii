'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AIInsightsDashboard } from '@/components/ai-insights/AIInsightsDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertCircle, RefreshCw } from 'lucide-react';
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
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Please sign in</CardTitle>
            <CardDescription>
              You need to be signed in to view AI insights
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {error ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalysis} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </CardContent>
        </Card>
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