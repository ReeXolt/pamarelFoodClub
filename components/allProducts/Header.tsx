'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import React from 'react';

interface HeaderProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	totalProducts: number;
	isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
	searchQuery,
	onSearchChange,
	totalProducts,
	isLoading,
}) => {
	return (
		<section className="bg-card border-b border-border">
			<div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
						<div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Link href="/" className="hover:text-primary transition-colors">
									Home
								</Link>
								<ChevronRight className="h-3 w-3" />
								<Link
									href="/shop"
									className="hover:text-primary transition-colors"
								>
									Shop
								</Link>
								<ChevronRight className="h-3 w-3" />
								<span className="text-foreground font-medium">
									All Products
								</span>
							</div>
							<h1 className="text-3xl md:text-4xl font-bold text-foreground">
								All Products
							</h1>
							<p className="text-muted-foreground mt-1">
								{isLoading ? 'Loading...' : `${totalProducts} products found`}
							</p>
						</div>
						<div className="relative w-full md:w-80">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								placeholder="Search products..."
								className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/40 transition-colors"
							/>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};
