import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { plans } from '@/lib/plans';

type Plan = (typeof plans)[0];

interface PlanRegistrationCardProps {
	plan: Plan;
}

export const PlanRegistrationCard = ({ plan }: PlanRegistrationCardProps) => {
	const router = useRouter();

	return (
		<div
			className={cn(
				'rounded-2xl p-6 text-primary-foreground flex flex-col justify-between',
				plan.id === 'basic' && 'bg-linear-to-br from-primary to-primary/80',
				plan.id === 'classic' &&
					'bg-linear-to-br from-[hsl(270,60%,40%)] to-[hsl(270,50%,30%)]',
				plan.id === 'deluxe' &&
					'bg-linear-to-br from-foreground to-foreground/80 text-card',
			)}
		>
			<div>
				<div className="flex items-center gap-2 mb-2">
					<Sparkles className="h-5 w-5" />
					<span className="text-xs font-semibold uppercase tracking-wider opacity-80">
						Start Your Journey
					</span>
				</div>
				<h2 className="text-2xl font-black mb-1">{plan.name.toUpperCase()}</h2>
				<p className="text-sm opacity-90 mb-4">{plan.tagline}</p>
				<p className="text-sm opacity-70">
					Progress through our 3-board system to unlock increasing rewards
				</p>
			</div>

			<div className="mt-6 space-y-3">
				<div className="flex items-baseline gap-2">
					<span className="text-3xl font-black">{plan.price}</span>
					<span className="text-sm opacity-70">Registration</span>
				</div>
				<Button
					variant={'default'}
					onClick={() => router.push(`/auth/register?planType=${plan.id}`)}
					// /auth/register?planType=${planType}
					className="w-full bg-card text-foreground hover:bg-card/90 font-bold rounded-xl h-11"
				>
					Join{' '}
					{plan.id === 'basic'
						? 'BASIC'
						: plan.id === 'classic'
							? 'CLASSIC'
							: 'DELUXE'}{' '}
					Plan
					<ArrowRight className="h-4 w-4 ml-1" />
				</Button>
			</div>
		</div>
	);
};
