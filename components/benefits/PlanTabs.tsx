/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { plans } from '@/lib/plans';

interface PlanTabsProps {
	activePlan: number;
	onSetActivePlan: (index: number) => void;
}

export const PlanTabs = ({ activePlan, onSetActivePlan }: PlanTabsProps) => {
	return (
		<div className="flex justify-center mb-8">
			<div className="inline-flex rounded-full bg-muted p-1 gap-1">
				{plans.map((p, i) => {
					const activeStyles: Record<string, string> = {
						basic: 'bg-primary text-primary-foreground shadow-sm',
						classic: 'bg-[hsl(270,60%,40%)] text-card shadow-sm',
						deluxe: 'bg-foreground text-card shadow-sm',
					};
					return (
						<motion.button
							key={p.id}
							onClick={() => onSetActivePlan(i)}
							whileTap={{ scale: 0.97 }}
							className={cn(
								'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
								activePlan === i
									? activeStyles[p.id]
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							{p.id === 'basic'
								? 'Basic Plan'
								: p.id === 'classic'
									? 'Classic Plan'
									: 'Deluxe Plan'}
						</motion.button>
					);
				})}
			</div>
		</div>
	);
};
