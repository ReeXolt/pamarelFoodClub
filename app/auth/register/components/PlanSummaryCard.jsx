import { motion } from 'framer-motion';
import { Sparkles, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlanSummaryCard({ plan, planId }) {
	const perks = [
		'Access to the 3-board reward system',
		'Exclusive food wallet benefits',
		'Community network access',
		'Arising Leader Bonus eligibility',
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
		>
			<div
				className={cn(
					'rounded-2xl p-6 text-primary-foreground bg-linear-to-br',
					plan.gradient,
					planId === 'deluxe' && 'text-card',
				)}
			>
				<div className="flex items-center gap-2 mb-3">
					<Sparkles className="h-5 w-5" />
					<span className="text-xs font-semibold uppercase tracking-wider opacity-80">
						You&apos;re Joining
					</span>
				</div>
				<h2 className="text-2xl font-black mb-1">{plan.name.toUpperCase()}</h2>

				<div className="mt-4 flex items-baseline gap-2">
					<span className="text-4xl font-black">{plan.price}</span>
					<span className="text-sm opacity-70">one-time</span>
				</div>

				<div className="mt-6 space-y-2.5">
					{perks.map((perk, i) => (
						<motion.div
							key={perk}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 + i * 0.06 }}
							className="flex items-center gap-2"
						>
							<div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
								<Check className="h-2.5 w-2.5" />
							</div>
							<span className="text-sm opacity-90">{perk}</span>
						</motion.div>
					))}
				</div>

				<div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-2">
					<Shield className="h-4 w-4 opacity-60" />
					<span className="text-xs opacity-60">
						Secure payment via Flutterwave
					</span>
				</div>
			</div>
		</motion.div>
	);
}
