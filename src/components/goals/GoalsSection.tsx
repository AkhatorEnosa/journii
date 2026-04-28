'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Target, Plus, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { goalService } from '@/lib/store';
import { tradeService } from '@/lib/store';
import { Goal, GoalProgress, Trade } from '@/lib/types';
import GoalModal from './GoalModal';
import GoalCard from './GoalCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type GoalFilter = 'all' | 'active' | 'completed' | 'failed';

export default function GoalsSection() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalProgresses, setGoalProgresses] = useState<GoalProgress[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<GoalFilter>('all');
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      return;
    }
    if (isLoaded && isSignedIn) {
      loadData();
    }
  }, [isLoaded, isSignedIn]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Loading goals for user:', user.id);
      const [goalsData, tradesData] = await Promise.all([
        goalService.getGoals(user.id).catch((err) => {
          console.error('Error loading goals:', err);
          return [];
        }),
        tradeService.getTrades(user.id).catch((err) => {
          console.error('Error loading trades:', err);
          return [];
        }),
      ]);

      console.log('Loaded goals:', goalsData.length, 'trades:', tradesData.length);
      setGoals(goalsData);
      setTrades(tradesData);

      // Calculate progress for each goal
      const progresses: GoalProgress[] = goalsData.map(goal =>
        goalService.getGoalProgress(user.id, goal, tradesData)
      );
      console.log('Calculated progress for goals:', progresses.length);
      setGoalProgresses(progresses);

      // Update goal statuses for completed/failed goals
      await goalService.updateGoalStatuses(user.id).catch(() => {});
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    // Validate goalData before sending
    if (!goalData.title || !goalData.targetAmount || !goalData.startDate || !goalData.endDate) {
      console.error('Missing required fields:', { title: !!goalData.title, targetAmount: goalData.targetAmount, startDate: goalData.startDate, endDate: goalData.endDate });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating goal with data:', JSON.stringify(goalData, null, 2));
      console.log('User ID:', user.id);
      
      const goalPayload = {
        title: goalData.title,
        description: goalData.description || '',
        targetAmount: goalData.targetAmount,
        startDate: goalData.startDate,
        endDate: goalData.endDate,
        status: 'active' as const,
        period: goalData.period,
      };
      
      console.log('Goal payload:', JSON.stringify(goalPayload, null, 2));
      
      await goalService.createGoal(user.id, goalPayload);
      console.log('Goal created successfully');
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create goal:', err);
      console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      alert(`Failed to create goal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!user || !deleteGoalId) return;

    setIsLoading(true);
    try {
      await goalService.deleteGoal(user.id, deleteGoalId);
      setIsDeleteDialogOpen(false);
      setDeleteGoalId(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeGoals = goalProgresses.filter(g => g.goal.status === 'active');
  const completedGoals = goalProgresses.filter(g => g.goal.status === 'completed');
  const failedGoals = goalProgresses.filter(g => g.goal.status === 'failed');

  const filteredGoals = goalProgresses.filter(g => {
    if (activeFilter === 'all') return true;
    return g.goal.status === activeFilter;
  });

  const StatCard = ({ label, count, color, filter }: { label: string; count: number; color: string; filter: GoalFilter }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`bg-muted/20 rounded-lg p-4 text-center transition-all cursor-pointer
        ${activeFilter === filter ? 'ring-2 ring-primary ring-offset-2' : 'hover:bg-muted/40'}
      `}
    >
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{count}</div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6" />
            Goals & Challenges
          </h2>
          <p className="text-muted-foreground mt-1">
            Set targets and track your trading progress
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Stats Summary - Clickable Filters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Active" count={activeGoals.length} color="text-blue-500" filter="active" />
        <StatCard label="Completed" count={completedGoals.length} color="text-emerald-500" filter="completed" />
        <StatCard label="Not Achieved" count={failedGoals.length} color="text-rose-500" filter="failed" />
      </div>

      {/* Filtered Goals List */}
      <div className="space-y-6">
        {filteredGoals.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground capitalize">
                {activeFilter === 'all' ? 'All Goals' : `${activeFilter} Goals`}
              </h3>
              {activeFilter !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Show All
                </Button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredGoals.map((progress) => (
                <GoalCard
                  key={progress.goal.id}
                  progress={progress}
                  showActions={progress.goal.status === 'active'}
                  onDelete={() => {
                    setDeleteGoalId(progress.goal.id);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        ) : goalProgresses.length === 0 && !isLoading ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Set a trading goal to challenge yourself and track your progress
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Button>
          </div>
        ) : filteredGoals.length === 0 && !isLoading ? (
          <div className="text-center py-8 bg-muted/20 rounded-lg border border-border">
            <p className="text-muted-foreground">No {activeFilter} goals</p>
          </div>
        ) : null}

        {isLoading && goals.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGoal}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Goal</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={handleDeleteGoal}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}