import { Trophy } from 'lucide-react';
import { BoardCard } from './BoardCard';
import { plans } from '@/lib/plans';

type Plan = (typeof plans)[0];

interface PlanProgressionPathProps {
	plan: Plan;
}

export const PlanProgressionPath = ({ plan }: PlanProgressionPathProps) => {
	return (
		<div>
			<h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
				<Trophy className="h-4 w-4 text-accent" />
				Board Progression Path
			</h3>
			<div className="grid sm:grid-cols-3 gap-3">
				{plan.boards.map((board, i) => (
					<BoardCard key={board.name} board={board} index={i} />
				))}
			</div>
		</div>
	);
};
