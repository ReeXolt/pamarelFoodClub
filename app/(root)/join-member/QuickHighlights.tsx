import { motion } from 'framer-motion';
import { Car, Plane, Heart, Home } from 'lucide-react';
import { plans } from '@/lib/plans';

type Plan = (typeof plans)[0];

interface QuickHighlightsProps {
	plan: Plan;
}

export const QuickHighlights = ({ plan }: QuickHighlightsProps) => {
	if (plan.id === 'basic') return null;

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
			{[
				{
					icon: Car,
					label: 'Car Incentive',
					value: plan.id === 'classic' ? '₦10M' : '₦20M',
				},
				{
					icon: Plane,
					label: 'Travel',
					value: plan.id === 'classic' ? 'African Trip' : 'International Trip',
				},
				{
					icon: Heart,
					label: 'Health Insurance',
					value: plan.id === 'classic' ? '₦1M' : 'Included',
				},
				{
					icon: Home,
					label: 'Housing Support',
					value: plan.id === 'classic' ? '—' : '₦40M',
				},
			].map((item, i) => (
				<motion.div
					key={item.label}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: i * 0.05 }}
					className="rounded-xl border border-border bg-card p-3 text-center"
				>
					<item.icon className="h-5 w-5 text-primary mx-auto mb-1" />
					<p className="text-xs text-muted-foreground">{item.label}</p>
					<p className="text-sm font-bold text-foreground">{item.value}</p>
				</motion.div>
			))}
		</div>
	);
};
