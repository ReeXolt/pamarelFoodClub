'use client';
import { Product } from '@/components/allProducts/data';
import { formatPrice } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProductPricingProps {
	product: Product;
}

export const ProductPricing = ({ product }: ProductPricingProps) => (
	<>
		{/* Price */}
		<div className="flex items-baseline gap-3 mb-2">
			<span className="text-3xl font-black text-foreground">
				{formatPrice(product.sellingPrice)}
			</span>
			{product.sellingPrice && (
				<span className="text-lg text-muted-foreground line-through">
					{formatPrice(product.price)}
				</span>
			)}
		</div>

		{/* Stock */}
		<div className="flex items-center gap-1.5 text-sm font-medium text-primary mb-3">
			<Check className="h-4 w-4" />
			{product.stock} items in stock
		</div>

		{/* Description */}
		<p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">
			{product.description}
		</p>
	</>
);
