'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	ChevronDown,
	LayoutGrid,
	List,
	SlidersHorizontal,
	X,
	ArrowUpDown,
	Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SORT_OPTIONS } from './data';

interface ToolbarProps {
	viewMode: 'grid' | 'list';
	onViewModeChange: (mode: 'grid' | 'list') => void;
	sortBy: string;
	onSortChange: (sort: string) => void;
	selectedCategories: string[];
	selectedSections: string[];
	onToggleCategory: (cat: string) => void;
	onToggleSection: (section: string) => void;
	onClearCategories: () => void;
	showFeaturedOnly: boolean;
	onToggleFeatured: () => void;
	activeFilterCount: number;
	onMobileFiltersOpen: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
	viewMode,
	onViewModeChange,
	sortBy,
	onSortChange,
	selectedCategories,
	selectedSections,
	onToggleCategory,
	onToggleSection,
	onClearCategories,
	showFeaturedOnly,
	onToggleFeatured,
	activeFilterCount,
	onMobileFiltersOpen,
}) => {
	const [sortOpen, setSortOpen] = useState(false);

	return (
		<div className="sticky top-16 z-30 bg-card/95 backdrop-blur-xl border-b border-border">
			<div className="mx-auto max-w-7xl px-4 lg:px-8">
				<div className="flex items-center justify-between py-3 gap-3">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={onMobileFiltersOpen}
							className="lg:hidden rounded-lg gap-2 text-sm"
						>
							<SlidersHorizontal className="h-4 w-4" />
							Filters
							{activeFilterCount > 0 && (
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
									{activeFilterCount}
								</span>
							)}
						</Button>

						{(selectedCategories.length > 0 ||
							selectedSections.length > 0 ||
							showFeaturedOnly) && (
							<div className="hidden md:flex items-center gap-1.5 flex-wrap">
								{/* Category filters */}
								{selectedCategories.map((c) => (
									<motion.button
										key={`cat-${c}`}
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.8, opacity: 0 }}
										onClick={() => onToggleCategory(c)}
										className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
									>
										{c} <X className="h-3 w-3" />
									</motion.button>
								))}

								{/* Section filters */}
								{selectedSections.map((s) => (
									<motion.button
										key={`sec-${s}`}
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.8, opacity: 0 }}
										onClick={() => onToggleSection(s)}
										className="flex items-center gap-1 bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium hover:bg-accent/20 transition-colors capitalize"
									>
										{s} <X className="h-3 w-3" />
									</motion.button>
								))}

								{/* Featured filter */}
								{showFeaturedOnly && (
									<motion.button
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.8, opacity: 0 }}
										onClick={onToggleFeatured}
										className="flex items-center gap-1 bg-destructive/10 text-destructive rounded-full px-3 py-1 text-xs font-medium hover:bg-destructive/20 transition-colors"
									>
										<Flame className="h-3 w-3" /> Featured
										<X className="h-3 w-3" />
									</motion.button>
								)}

								<button
									onClick={() => {
										onClearCategories();
										// Reset other filters if needed
									}}
									className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
								>
									Clear all
								</button>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						<div className="flex bg-muted rounded-lg p-0.5">
							<button
								onClick={() => onViewModeChange('grid')}
								className={`p-2 rounded-md transition-all duration-200 ${
									viewMode === 'grid'
										? 'bg-card shadow-sm text-primary'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<LayoutGrid className="h-4 w-4" />
							</button>
							<button
								onClick={() => onViewModeChange('list')}
								className={`p-2 rounded-md transition-all duration-200 ${
									viewMode === 'list'
										? 'bg-card shadow-sm text-primary'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								<List className="h-4 w-4" />
							</button>
						</div>

						<div className="relative">
							<button
								onClick={() => setSortOpen(!sortOpen)}
								className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
							>
								<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
								<span className="hidden sm:inline">
									{SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
										sortOpen ? 'rotate-180' : ''
									}`}
								/>
							</button>
							<AnimatePresence>
								{sortOpen && (
									<motion.div
										initial={{ opacity: 0, y: -5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl border border-border shadow-xl overflow-hidden z-20"
									>
										{SORT_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												onClick={() => {
													onSortChange(opt.value);
													setSortOpen(false);
												}}
												className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
													sortBy === opt.value
														? 'bg-primary/10 text-primary font-medium'
														: 'text-foreground hover:bg-muted/50'
												}`}
											>
												{opt.label}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
