"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanTabs } from './PlanTabs';
import { PlanRegistrationCard } from './PlanRegistrationCard';
import { PlanProgressionPath } from './PlanProgressionPath';
import { QuickHighlights } from './QuickHighlights';
import { ComparisonTable } from './ComparisonTable';
import { plans } from '@/lib/plans';

const Benefits = () => {
  const [activePlan, setActivePlan] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const plan = plans[activePlan];

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Choose Your <span className="text-accent">Food Plan</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Select the plan that matches your goals and start earning rewards
            today
          </p>
        </motion.div>

        {/* Plan Tabs */}
        <PlanTabs activePlan={activePlan} onSetActivePlan={setActivePlan} />

        {/* Plan Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── Registration CTA + Board Cards ── */}
            <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mb-8">
              <PlanRegistrationCard plan={plan} />
              <PlanProgressionPath plan={plan} />
            </div>

            {/* ── Quick Highlights ── */}
            <QuickHighlights plan={plan} />
          </motion.div>
        </AnimatePresence>

        {/* ── Comparison Table Toggle ── */}
        <div className="text-center mb-4">
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
            className="rounded-full gap-2"
          >
            {showComparison ? 'Hide' : 'Compare All Plans'}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                showComparison && 'rotate-180',
              )}
            />
          </Button>
        </div>

        {/* ── Comparison Table ── */}
        <ComparisonTable showComparison={showComparison} />
      </main>

    </div>
  );
};

export default Benefits;
