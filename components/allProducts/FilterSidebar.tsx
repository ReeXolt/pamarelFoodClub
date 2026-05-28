'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Flame } from 'lucide-react';
import { SECTIONS } from './data';

export const FilterSidebar = ({
	categoryFilters,
	selectedCategories,
	onToggleCategory,
	priceRange,
	onPriceRange,
	showFeaturedOnly,
	onToggleFeatured,
	selectedSections,
	onToggleSection,
}: {
	categoryFilters: string[];
	selectedCategories: string[];
	onToggleCategory: (_c: string) => void;
	priceRange: [number, number];
	onPriceRange: (_r: [number, number]) => void;
	showFeaturedOnly: boolean;
	onToggleFeatured: () => void;
	selectedSections: string[];
	onToggleSection: (_section: string) => void;
}) => {
	const [catOpen, setCatOpen] = useState(true);
	const [priceOpen, setPriceOpen] = useState(true);
	const [sectionsOpen, setSectionsOpen] = useState(true);

	return (
		<aside className="space-y-6">
			{/* Categories */}
			<div className="bg-card rounded-xl border border-border overflow-hidden">
				<button
					onClick={() => setCatOpen(!catOpen)}
					className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-foreground hover:bg-muted/50 transition-colors"
				>
					Categories
					<ChevronDown
						className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
					/>
				</button>
				<AnimatePresence>
					{catOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="overflow-hidden"
						>
							<div className="px-5 pb-4 space-y-1">
								{categoryFilters.map((cat) => (
									<label
										key={cat}
										onClick={() => onToggleCategory(cat)}
										className="flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
									>
										<div
											className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
												selectedCategories.includes(cat)
													? 'bg-primary border-primary'
													: 'border-border group-hover:border-primary/40'
											}`}
										>
											{selectedCategories.includes(cat) && (
												<Check className="h-3 w-3 text-primary-foreground" />
											)}
										</div>
										<span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
											{cat}
										</span>
									</label>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Price range */}
			<div className="bg-card rounded-xl border border-border overflow-hidden">
				<button
					onClick={() => setPriceOpen(!priceOpen)}
					className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-foreground hover:bg-muted/50 transition-colors"
				>
					Price Range
					<ChevronDown
						className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${priceOpen ? 'rotate-180' : ''}`}
					/>
				</button>
				<AnimatePresence>
					{priceOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="overflow-hidden"
						>
							<div className="px-5 pb-4 space-y-3">
								<div className="flex gap-3">
									<div className="flex-1">
										<label className="text-xs text-muted-foreground mb-1 block">
											Min
										</label>
										<input
											type="number"
											value={priceRange[0]}
											onChange={(e) =>
												onPriceRange([+e.target.value, priceRange[1]])
											}
											className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
										/>
									</div>
									<div className="flex-1">
										<label className="text-xs text-muted-foreground mb-1 block">
											Max
										</label>
										<input
											type="number"
											value={priceRange[1]}
											onChange={(e) =>
												onPriceRange([priceRange[0], +e.target.value])
											}
											className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
										/>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Sections */}
			<div className="bg-card rounded-xl border border-border overflow-hidden">
				<button
					onClick={() => setSectionsOpen(!sectionsOpen)}
					className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-foreground hover:bg-muted/50 transition-colors"
				>
					Sections
					<ChevronDown
						className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${sectionsOpen ? 'rotate-180' : ''}`}
					/>
				</button>
				<AnimatePresence>
					{sectionsOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="overflow-hidden"
						>
							<div className="px-5 pb-4 space-y-1">
								{SECTIONS.map((section) => (
									<label
										key={section.id}
										onClick={() => onToggleSection(section.id)}
										className="flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
									>
										<div
											className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
												selectedSections.includes(section.id)
													? 'bg-primary border-primary'
													: 'border-border group-hover:border-primary/40'
											}`}
										>
											{selectedSections.includes(section.id) && (
												<Check className="h-3 w-3 text-primary-foreground" />
											)}
										</div>
										<span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
											{section.icon} {section.label}
										</span>
									</label>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Featured toggle */}
			<div className="bg-card rounded-xl border border-border px-5 py-4">
				<label className="flex items-center gap-3 cursor-pointer group"
				onClick={() => onToggleFeatured()}>
					<div
						className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
							showFeaturedOnly
								? 'bg-accent border-accent'
								: 'border-border group-hover:border-accent/40'
						}`}
					>
						{showFeaturedOnly && (
							<Check className="h-3 w-3 text-accent-foreground" />
						)}
					</div>
					<span className="text-sm font-medium text-foreground">
						Featured Only
					</span>
					<Flame className="h-4 w-4 text-accent ml-auto" />
				</label>
			</div>
		</aside>
	);
};
