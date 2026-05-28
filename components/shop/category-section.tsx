'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, FolderOpen } from 'lucide-react';
import { useInView } from 'framer-motion';
import Image from 'next/image';
import { routes } from '@/utils/routes';

// Function to create slug from category name
const createUrl = (
	basePath: string,
	params: Record<string, string>,
) => {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		searchParams.append(key, value);
	});

	return `${basePath}?${searchParams.toString()}`;
};

type Category = {
	_id: string;
	name: string;
	image: string;
};

export default function CategorySection() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<null | string>(null);
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-80px' });

	// Fetch categories
	const fetchCategories = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch('/api/categories');
			const data = await response.json();

			if (data.success) {
				setCategories(data.categories);
			} else {
				setError('Failed to load categories');
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
			setError('Error loading categories');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	if (loading) {
		return (
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
							Shop by Category
						</h2>
						<p className="text-lg text-gray-600">
							Discover our wide range of products
						</p>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
						{[...Array(6)].map((_, index) => (
							<div key={index} className="animate-pulse">
								<div className="bg-gray-300 aspect-square rounded-lg mb-3"></div>
								<div className="h-4 bg-gray-300 rounded mb-2"></div>
								<div className="h-3 bg-gray-300 rounded w-3/4"></div>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
						<FolderOpen className="w-12 h-12 text-red-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-red-800 mb-2">
							Unable to load categories
						</h3>
						<p className="text-red-700 mb-4">{error}</p>
						<button
							onClick={fetchCategories}
							className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
						>
							Try Again
						</button>
					</div>
				</div>
			</section>
		);
	}

	if (categories.length === 0) {
		return (
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h3 className="text-xl font-medium text-gray-900 mb-2">
						No categories available
					</h3>
					<p className="text-gray-600">Check back later for new categories</p>
				</div>
			</section>
		);
	}

	return (
		<section className="py-16  bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Shop by Category
					</h2>
					<p className="text-base  text-gray-500 max-w-140 mx-auto">
						Explore our carefully curated collection of products organized by
						category. Find exactly what you&apos;re looking for with ease.
					</p>
				</div>

				{/* Categories Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
					{categories.map((category) => (
						<Link
							key={category._id}
							href={createUrl(routes.shop.category, { cat: category.name })}
							className="group h-full"
						>
							<div className="bg-white rounded-xl h-full shadow-sm border border-gray-100 hover:shadow-lg hover:border-yellow-200 transition-all duration-300 overflow-hidden">
								{/* Category Image */}
								<div className="h-44 bg-gray-50 overflow-hidden">
									<Image
										src={category.image}
										alt={category.name}
										unoptimized
										width={300}
										height={300}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
									/>
								</div>

								{/* Category Info */}
								<div className="p-4 bg-gray-50 h-full">
									<h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
										{category.name}
									</h3>

									{/* View Products Link */}
									<div className="flex items-center justify-between">
										<span className="text-xs text-gray-500">Shop now</span>
										<ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
