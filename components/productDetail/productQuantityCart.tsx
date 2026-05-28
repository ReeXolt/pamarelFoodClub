'use client';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/components/allProducts/data';

interface ProductQuantityCartProps {
	product: Product;
	quantity: number;
	handleAddToCart: () => void;
	onQuantityChange: (_qty: number) => void;
}

export const ProductQuantityCart = ({
	product,
	quantity,
	handleAddToCart,
	onQuantityChange,
}: ProductQuantityCartProps) => (
	<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
		<div className="flex items-center">
			<span className="text-sm font-semibold text-foreground mr-3">
				Quantity:
			</span>
			<div className="flex items-center border border-border rounded-lg overflow-hidden">
				<button
					onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
					className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
				>
					<Minus className="h-4 w-4" />
				</button>
				<span className="h-10 w-12 flex items-center justify-center text-sm font-semibold text-foreground border-x border-border">
					{quantity}
				</span>
				<button
					onClick={() =>
						onQuantityChange(Math.min(product.stock, quantity + 1))
					}
					className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>
		</div>

		<Button
			onClick={handleAddToCart}
			disabled={product.stock === 0}
			className="flex-1 sm:flex-initial w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-10 py-5 font-semibold text-base gap-2"
		>
			<ShoppingCart className="h-5 w-5" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
		</Button>
	</div>
);
