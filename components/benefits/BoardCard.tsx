import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plans } from '@/lib/plans';

export const BoardCard = ({
	board,
	index,
}: {
	board: (typeof plans)[0]['boards'][0];
	index: number;
}) => {
	const bgColors = [
		'border-primary/30 bg-primary/5',
		'border-muted-foreground/20 bg-muted/30',
		'border-accent/30 bg-accent/5',
	];
	const IconComp = board.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1, duration: 0.3 }}
			className={cn(
				'rounded-xl border p-4 flex flex-col gap-3',
				bgColors[index],
			)}
		>
			<div className="flex items-center gap-2">
				<IconComp className="h-5 w-5 text-accent" />
				<div>
					<h4 className="font-bold text-sm text-foreground">{board.name}</h4>
					<p className="text-xs text-muted-foreground">{board.level}</p>
				</div>
			</div>

			<div className="space-y-1.5">
				<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					Requirements
				</p>
				{board.requirements.map((r, i) => (
					<p key={i} className="text-xs text-foreground">
						{r}
					</p>
				))}
			</div>

			<div className="space-y-1">
				<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					Rewards
				</p>
				{board.rewards.map((r, i) => (
					<div key={i} className="flex items-start gap-1.5">
						<Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
						<p className="text-xs text-foreground leading-tight">{r}</p>
					</div>
				))}
			</div>
		</motion.div>
	);
};
