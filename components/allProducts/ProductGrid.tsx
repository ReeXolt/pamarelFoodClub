'use client';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCardList } from './ProductCardList';
import type { Product } from './data';
import React from 'react';
import { ProductCardGrid } from './ProductCardGrid';

interface ProductGridProps {
	products: Product[];
	isLoading: boolean;
	viewMode: 'grid' | 'list';
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onClearFilters: () => void;
	productsPerPage: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
	products,
	isLoading,
	viewMode,
	currentPage,
	totalPages,
	onPageChange,
	onClearFilters,
	productsPerPage,
}) => {
	if (isLoading) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				{[...Array(productsPerPage)].map((_, i) => (
					<div key={`skeleton-${i}`} className="animate-pulse">
						<div className="bg-muted h-48 rounded-lg mb-4"></div>
						<div className="bg-muted h-4 rounded mb-2"></div>
						<div className="bg-muted h-4 rounded w-3/4 mb-2"></div>
						<div className="bg-muted h-6 rounded w-1/2"></div>
					</div>
				))}
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="text-center py-20"
			>
				<Tag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
				<h3 className="text-lg font-semibold text-foreground mb-2">
					No products found
				</h3>
				<p className="text-muted-foreground text-sm mb-6">
					Try adjusting your filters or search terms.
				</p>
				<Button
					variant="outline"
					onClick={onClearFilters}
					className="rounded-lg"
				>
					Clear Filters
				</Button>
			</motion.div>
		);
	}

	return (
		<>
			{viewMode === 'grid' ? (
				<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
					{products.map((product, i) => (
						<ProductCardGrid key={product._id} product={product} index={i} />
					))}
				</div>
			) : (
				<div className="space-y-4">
					{products.map((product, i) => (
						<ProductCardList key={product._id} product={product} index={i} />
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-2 mt-12">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						Previous
					</Button>
					<div className="flex items-center gap-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								variant={currentPage === page ? 'default' : 'outline'}
								size="sm"
								onClick={() => onPageChange(page)}
								className="w-10 h-10"
							>
								{page}
							</Button>
						))}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						Next
					</Button>
				</div>
			)}
		</>
	);
};
