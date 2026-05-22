import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PlanSelector({ planConfig, planId }) {
	const router = useRouter();

	return (
		<div className="mt-4 flex gap-2">
			{Object.entries(planConfig).map(([id, cfg]) => (
				<motion.button
					key={id}
					whileTap={{ scale: 0.95 }}
					onClick={() => router.push(`/auth/register?planType=${id}`)}
					className={cn(
						'flex-1 rounded-xl border py-2 text-xs font-semibold uppercase tracking-wide transition-all',
						planId === id
							? cfg.badge
							: 'border-border text-muted-foreground hover:border-border/80',
					)}
				>
					{id}
				</motion.button>
			))}
		</div>
	);
}
