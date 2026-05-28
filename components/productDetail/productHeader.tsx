'use client';
import { Product } from '@/components/allProducts/data';
import { Star } from 'lucide-react';

export const ProductHeader = ({ product }: { product: Product }) => (
	<>
		{/* Breadcrumb */}
		<div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
			<span>{product.category.name}</span>
			<span>·</span>
			<span className="text-primary/70">{product.section}</span>
		</div>

		{/* Title */}
		<h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 leading-tight">
			{product.name}
		</h1>

		{/* Rating */}
		{product.ratings.average !== 0 && (
			<div className="flex items-center gap-2 mb-3">
				<div className="flex items-center gap-0.5">
					{Array.from({ length: 5 }).map((_, i) => (
						<Star
							key={i}
							className={`h-4 w-4 ${i < Math.floor(product.ratings.average) ? 'text-accent fill-accent' : 'text-border'}`}
						/>
					))}
				</div>
				<span className="text-sm text-muted-foreground">
					{product.ratings.average.toFixed(1)} {product.ratings.count} reviews
				</span>
			</div>
		)}
	</>
);
