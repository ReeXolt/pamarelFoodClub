'use client';
import { Product } from '@/components/allProducts/data';
import { ProductReviews } from '@/components/ProductReviews';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star } from 'lucide-react';
import { ParamValue } from 'next/dist/server/request/params';
// import { ProductCategory } from '@/types/productTypes';

interface ProductDetailsTabsProps {
	product: Product;
	productId: ParamValue;
}

export const ProductDetailsTabs = ({
	product,
	productId,
}: ProductDetailsTabsProps) => (
	<div className="border-t border-border pt-4">
		<Tabs defaultValue="description">
			<TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-6">
				<TabsTrigger
					value="description"
					className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2 text-sm font-medium"
				>
					Description
				</TabsTrigger>
				<TabsTrigger
					value="specifications"
					className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2 text-sm font-medium"
				>
					Specifications
				</TabsTrigger>
				<TabsTrigger
					value="reviews"
					className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-2 text-sm font-medium"
				>
					Reviews
				</TabsTrigger>
			</TabsList>
			<TabsContent value="description" className="mt-3">
				<p className="text-sm text-muted-foreground leading-relaxed">
					{product.description}
				</p>
			</TabsContent>
			<TabsContent value="specifications" className="mt-3">
				<div className="space-y-2">
					{product.tags.length > 0 ? (
						<div>
							{product.tags.map((s) => (
								<div
									key={s}
									className="flex justify-between text-sm py-1.5 border-b border-border/50 last:border-0"
								>
									<span className="text-muted-foreground">{s}</span>
									{/* <span className="font-medium text-foreground">{s.value}</span> */}
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No specifications available.
						</p>
					)}
				</div>
			</TabsContent>
			<TabsContent value="reviews" className="mt-3">
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<Star className="w-8 h-8 text-gray-400" />
					</div>
					<ProductReviews productId={productId} />
				</div>
			</TabsContent>
		</Tabs>
	</div>
);
