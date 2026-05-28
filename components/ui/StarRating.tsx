'use client';
import { Star } from 'lucide-react';

interface StarRatingProps {
	rating: number;
	reviews: number;
	size?: 'sm' | 'md';
}

export const StarRating = ({
	rating,
	reviews,
	size = 'md',
}: StarRatingProps) => {
	const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
	const textClass = size === 'sm' ? 'text-xs' : 'text-sm';

	return (
		<div className="flex items-center gap-1.5">
			<div className="flex items-center gap-0.5">
				{Array.from({ length: 5 }).map((_, i) => (
					<Star
						key={i}
						className={`${sizeClass} ${i < Math.floor(rating) ? 'text-accent fill-accent' : 'text-border'}`}
					/>
				))}
			</div>
			<span className={`${textClass} text-muted-foreground`}>({reviews})</span>
		</div>
	);
};
