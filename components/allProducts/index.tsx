'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { FilterSidebar } from './FilterSidebar';
import { MobileFilterSheet } from './MobileFilterSheet';
import { ScrollToTop } from '@/components/reuseables/ScrollToTopBtn';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { ProductGrid } from './ProductGrid';
import type { categoryFilters, Product } from './data';
import { routes } from '@/utils/routes';

const productsPerPage = 12;

export const AllProducts = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	// URL params
	const initialCategory = searchParams.get('cat') || '';
	const initialSections = searchParams.get('sections') || '';
	const initialSearchQuery = searchParams.get('q') || '';
	const initialPage = parseInt(searchParams.get('page') || '1', 10);
	const initialSort = searchParams.get('sort') || 'popular';
	const initialFeatured = searchParams.get('featured') === 'true';

	// State for filters and display
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		initialCategory ? initialCategory.split(',').filter(Boolean) : [],
	);
	const [selectedSections, setSelectedSections] = useState<string[]>(
		initialSections ? initialSections.split(',').filter(Boolean) : [],
	);
	const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
	const [showFeaturedOnly, setShowFeaturedOnly] = useState(initialFeatured);
	const [categories, setCategories] = useState<categoryFilters[]>([]);
	const [sortBy, setSortBy] = useState(initialSort);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	// API state
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalProducts, setTotalProducts] = useState(0);

	// Track previous price range to detect price-only changes
	const prevPriceRangeRef = useRef<[number, number]>(priceRange);

	// Update URL when filters change
	const updateURL = (
		cats: string[],
		sections: string[],
		query: string,
		page: number,
		sort: string,
		featured?: boolean,
	) => {
		const params = new URLSearchParams();
		if (cats.length > 0) params.append('cat', cats.join(',')); // support multiple categories
		if (sections.length > 0) params.append('sections', sections.join(','));
		if (query) params.append('q', query);
		if (page > 1) params.append('page', page.toString());
		if (sort !== 'popular') params.append('sort', sort);
		if (featured) params.append('featured', 'true');

		const queryString = params.toString();
		router.push(queryString ? routes.shop.category + `?${queryString}` : routes.shop.category);
	};

	const toggleCategory = (c: string) => {
		const newCategories = selectedCategories.includes(c)
			? selectedCategories.filter((x) => x !== c)
			: [...selectedCategories, c]; // allow multiple selections
		setSelectedCategories(newCategories);
		setCurrentPage(1); // reset to page 1 on filter change
		updateURL(newCategories, selectedSections, searchQuery, 1, sortBy);
	};

	const onToggleSection = (sections: string) => {
		// Toggle exclusive sections selection - only one sections at a time
		const newSections = selectedSections.includes(sections)
			? [] // deselect if already selected
			: [sections]; // select only this sections
		setSelectedSections(newSections);
		setCurrentPage(1);
		updateURL(selectedCategories, newSections, searchQuery, 1, sortBy);
	};

	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		setCurrentPage(1);
		updateURL(selectedCategories, selectedSections, query, 1, sortBy);
	};

	const handleSortChange = (newSort: string) => {
		setSortBy(newSort);
		setCurrentPage(1);
		updateURL(selectedCategories, selectedSections, searchQuery, 1, newSort);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		updateURL(selectedCategories, selectedSections, searchQuery, page, sortBy);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handlePriceRangeChange = (range: [number, number]) => {
		setPriceRange(range);
		// The useEffect with 3-second debounce will handle the page reset and API call
	};

	const handleClearFilters = () => {
		setSearchQuery('');
		setSelectedCategories([]);
		setSelectedSections([]);
		setPriceRange([0, 100000]);
		setShowFeaturedOnly(false);
		setSortBy('popular');
		setCurrentPage(1);
		router.push(routes.shop.category);
	};

	// Fetch categories (for future use in filtering)
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch('/api/categories');
				const data = await response.json();
				if (data.success) {
					setCategories(data.categories);
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
		};

		fetchCategories();
	}, []);

	// Fetch products
	useEffect(() => {
		const fetchProducts = async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams();

				// Add pagination
				params.append('page', currentPage.toString());
				params.append('limit', productsPerPage.toString());

				// Add category filter if selected
				if (selectedCategories.length > 0) {
					params.append('category', selectedCategories.join(','));
				}

				// Add sections filter if selected
				if (selectedSections.length > 0) {
					params.append('sections', selectedSections.join(','));
				}

				// Add search query if exists
				if (searchQuery) {
					params.append('search', searchQuery);
				}

				// Add price filters
				if (priceRange[0] > 0)
					params.append('minPrice', priceRange[0].toString());
				if (priceRange[1] < 100000)
					params.append('maxPrice', priceRange[1].toString());

				// Add featured filter
				if (showFeaturedOnly) params.append('featured', 'true');

				// Add sort option
				params.append('sort', sortBy);

				const response = await fetch(
					`/api/products/filter?${params.toString()}`,
				);
				const data = await response.json();

				if (data.success) {
					setProducts(data.products);
					setTotalProducts(data.pagination?.total || 0);
				} else {
					setProducts([]);
					setTotalProducts(0);
				}
			} catch {
				setProducts([]);
				setTotalProducts(0);
			} finally {
				setIsLoading(false);
			}
		};

		// Debounce search to avoid too many requests (300ms for regular filters, 3s for price range)
		const isPriceRangeChanged =
			priceRange[0] !== prevPriceRangeRef.current[0] ||
			priceRange[1] !== prevPriceRangeRef.current[1];
		const debounceTime = isPriceRangeChanged ? 3000 : 300;

		prevPriceRangeRef.current = priceRange;

		const timeoutId = setTimeout(() => {
			fetchProducts();
		}, debounceTime);

		return () => clearTimeout(timeoutId);
	}, [
		selectedCategories,
		selectedSections,
		currentPage,
		searchQuery,
		sortBy,
		showFeaturedOnly,
		priceRange,
	]);
	// Calculate pagination info
	const totalPages = Math.ceil(totalProducts / productsPerPage);
	const activeFilterCount =
		selectedCategories.length +
		(showFeaturedOnly ? 1 : 0) +
		(priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0) +
		selectedSections.length;

	const filterContent = (
		<FilterSidebar
			categoryFilters={categories.map((c) => c.name)}
			selectedCategories={selectedCategories}
			onToggleCategory={toggleCategory}
			priceRange={priceRange}
			onPriceRange={handlePriceRangeChange}
			showFeaturedOnly={showFeaturedOnly}
			onToggleFeatured={() => {
				const newFeatured = !showFeaturedOnly;
				setShowFeaturedOnly(newFeatured);
				setCurrentPage(1);
				updateURL(
					selectedCategories,
					selectedSections,
					searchQuery,
					1,
					sortBy,
					newFeatured,
				);
			}}
			selectedSections={selectedSections}
			onToggleSection={onToggleSection}
		/>
	);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<Header
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				totalProducts={totalProducts}
				isLoading={isLoading}
			/>

			{/* Toolbar */}
			<Toolbar
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				sortBy={sortBy}
				onSortChange={handleSortChange}
				selectedCategories={selectedCategories}
				selectedSections={selectedSections}
				onToggleCategory={toggleCategory}
				onToggleSection={onToggleSection}
				onClearCategories={() => {
					setSelectedCategories([]);
					updateURL([], selectedSections, searchQuery, 1, sortBy);
				}}
				showFeaturedOnly={showFeaturedOnly}
				onToggleFeatured={() => {
					const newFeatured = !showFeaturedOnly;
					setShowFeaturedOnly(newFeatured);
					setCurrentPage(1);
					updateURL(
						selectedCategories,
						selectedSections,
						searchQuery,
						1,
						sortBy,
						newFeatured,
					);
				}}
				activeFilterCount={activeFilterCount}
				onMobileFiltersOpen={() => setMobileFiltersOpen(prev => !prev)}
			/>

			{/* Main content */}
			<div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
				<div className="flex gap-8">
					{/* Desktop sidebar */}
					<div className="hidden lg:block w-64 shrink-0">
						<div className="sticky top-36">{filterContent}</div>
					</div>

					{/* Product grid */}
					<div className="flex-1 min-w-0">
						<ProductGrid
							products={products}
							isLoading={isLoading}
							viewMode={viewMode}
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
							onClearFilters={handleClearFilters}
							productsPerPage={productsPerPage}
						/>
					</div>
				</div>
			</div>
			{/* Mobile filter sheet */}
			<MobileFilterSheet
				open={mobileFiltersOpen}
				onClose={() => setMobileFiltersOpen(false)}
			>
				{filterContent}
			</MobileFilterSheet>
			<ScrollToTop />
		</div>
	);
};
