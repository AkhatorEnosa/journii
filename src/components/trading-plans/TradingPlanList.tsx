'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Target,
  Edit,
  Trash2,
  Plus,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react';
import { TradingPlan } from '@/lib/types';
import TradingPlanDetailsModal from './TradingPlanDetailsModal';

interface TradingPlanListProps {
  plans: TradingPlan[];
  onView?: (plan: TradingPlan) => void;
  onEdit: (plan: TradingPlan) => void;
  onDelete: (plan: TradingPlan) => void;
  onCreateNew: () => void;
  onUseTemplate?: () => void;
  isLoading?: boolean;
  onDeleted?: () => void;
}

export default function TradingPlanList({
  plans,
  onView,
  onEdit,
  onDelete,
  onCreateNew,
  onUseTemplate,
  onDeleted,
  isLoading = false
}: TradingPlanListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingPlan, setViewingPlan] = useState<TradingPlan | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<TradingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (plan: TradingPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    setIsDeleting(true);
    try {
      setDeletingId(planToDelete.id);
      await onDelete(planToDelete);
      onDeleted?.();
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleView = (plan: TradingPlan) => {
    setViewingPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleViewClose = () => {
    setIsViewModalOpen(false);
    setViewingPlan(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Trading Plans Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Create your first trading plan to document your strategy and maintain trading discipline.
          </p>
          <div className="flex gap-3">
            {onUseTemplate && (
              <Button onClick={onUseTemplate} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Use Template
              </Button>
            )}
            <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create From Scratch
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 z-50 bg-background py-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Your Trading Plans</h3>
          <p className="text-sm text-muted-foreground">
            {plans.length} plan{plans.length !== 1 ? 's' : ''} ({plans.filter(p => p.status === 'active').length} active)
          </p>
        </div>
        <div className="flex gap-2">
          {onUseTemplate && (
            <Button onClick={onUseTemplate} variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
              Use Template
            </Button>
          )}
          <Button onClick={onCreateNew} size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-foreground text-lg capitalize">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">
                    {plan.description || 'No description'}
                  </CardDescription>
                </div>
                <Badge 
                  variant={plan.status === 'active' ? 'default' : 'secondary'}
                  className={plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                >
                  {plan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instruments */}
              {plan.instruments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>Instruments:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {plan.instruments.slice(0, 5).map((inst) => (
                      <Badge key={inst} variant="outline" className="text-xs border-border">
                        {inst}
                      </Badge>
                    ))}
                    {plan.instruments.length > 5 && (
                      <Badge variant="outline" className="text-xs border-border">
                        +{plan.instruments.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Rules Preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>Rules Overview:</span>
                </div>
                <div className="text-xs text-foreground space-y-1">
                  {plan.entryRules && (
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="line-clamp-1">{plan.entryRules}</span>
                    </div>
                  )}
                  {plan.exitRules && (
                    <div className="flex items-start gap-2">
                      <span className="text-rose-500">✕</span>
                      <span className="line-clamp-1">{plan.exitRules}</span>
                    </div>
                  )}
                  {plan.riskManagement && (
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">⚠</span>
                      <span className="line-clamp-1">{plan.riskManagement}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDate(plan.updatedAt)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(plan)}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(plan)}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(plan)}
                    className="h-8 px-2 text-muted-foreground hover:text-rose-500"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Plan Modal */}
      <TradingPlanDetailsModal
        isOpen={isViewModalOpen}
        onClose={handleViewClose}
        plan={viewingPlan}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteCancel}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Trading Plan</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground hover:text-foreground" onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
