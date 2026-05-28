'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/utils/routes';

interface FlashSale {
	active: boolean;
	discountPercentage: number;
	startDate: string;
	endDate: string;
}

interface Ratings {
	average: number;
}

interface Product {
	_id: string;
	name: string;
	price: number;
	stock: number;
	images: string[];
	flashSale?: FlashSale;
	ratings?: Ratings;
}

interface NewArrivalsResponse {
	success: boolean;
	products: Product[];
}

const formatPrice = (price: number): string => {
	return price.toLocaleString('en-NG');
};

export function NewArrivals() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		void fetchNewArrivals();
	}, []);

	const fetchNewArrivals = async (): Promise<void> => {
		try {
			const response = await fetch('/api/products/new-arrivals');

			if (!response.ok) {
				throw new Error('Failed to fetch products');
			}

			const data: NewArrivalsResponse = await response.json();

			if (data.success) {
				setProducts(data.products);
			}
		} catch (error) {
			console.error('Error fetching new arrivals:', error);
		} finally {
			setLoading(false);
		}
	};

	const calculateDiscountedPrice = (product: Product): number => {
		if (
			product.flashSale?.active &&
			product.flashSale.discountPercentage > 0
		) {
			const discount =
				product.price * (product.flashSale.discountPercentage / 100);

			return product.price - discount;
		}

		return product.price;
	};

	const isFlashSaleActive = (product: Product): boolean => {
		if (!product.flashSale?.active) return false;

		const now = new Date();
		const startDate = new Date(product.flashSale.startDate);
		const endDate = new Date(product.flashSale.endDate);

		return now >= startDate && now <= endDate;
	};

	if (loading) {
		return (
			<div className="bg-white py-12">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="mb-8 text-3xl font-bold text-gray-900">
							New Arrivals
						</h2>

						<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, index) => (
								<div key={index} className="animate-pulse">
									<div className="mb-4 h-64 rounded-lg bg-gray-200" />

									<div className="mb-2 h-4 rounded bg-gray-200" />

									<div className="h-4 w-3/4 rounded bg-gray-200" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 className="mb-2 text-center text-3xl font-bold text-gray-900">
					New Arrivals
				</h2>

				<p className="mb-8 text-center text-gray-600">
					Discover our latest products
				</p>

				<div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{products.slice(0, 6).map((product) => {
						const flashSaleActive = isFlashSaleActive(product);

						const discountedPrice =
							calculateDiscountedPrice(product);

						return (
							<Link
								key={product._id}
								href={routes.shop.product(product._id.toString())}
								className="group relative flex h-full flex-col rounded-lg border shadow-sm transition-all duration-300 group-hover:shadow-2xl"
							>
								<div className="relative h-64 overflow-hidden rounded-t-lg">
									{product.images?.length > 0 ? (
										<Image
											src={product.images[0]}
											alt={product.name}
											fill
											unoptimized
											className="object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-gray-200">
											<span className="text-gray-400">
												No Image
											</span>
										</div>
									)}

									{flashSaleActive && product.flashSale && (
										<div className="absolute top-2 left-2 rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white">
											{
												product.flashSale
													.discountPercentage
											}
											% OFF
										</div>
									)}

									<div className="bg-primary absolute top-2 right-2 rounded-lg px-2 py-1 text-[10px] font-bold text-white">
										NEW
									</div>
								</div>

								<div className="flex flex-1 flex-col justify-between rounded-b-lg bg-gray-100 p-4">
									<h3 className="mb-2 line-clamp-2 text-left text-[13px] font-semibold text-gray-900 transition-colors group-hover:text-yellow-600">
										{product.name}
									</h3>

									<div className="my-2 space-y-2">
										<div className="flex items-center space-x-2">
											{flashSaleActive ? (
												<>
													<span className="text-lg font-bold text-yellow-600">
														₦
														{formatPrice(
															discountedPrice,
														)}
													</span>

													<span className="text-sm text-gray-500 line-through">
														₦
														{formatPrice(
															product.price,
														)}
													</span>
												</>
											) : (
												<span className="text-sm font-bold text-gray-900">
													₦
													{formatPrice(
														product.price,
													)}
												</span>
											)}
										</div>

										{product.ratings?.average ? (
											<div className="flex items-center space-x-1">
												<div className="text-yellow-500">
													★
												</div>

												<span className="text-sm text-gray-600">
													{product.ratings.average.toFixed(
														1,
													)}
												</span>
											</div>
										) : null}
									</div>

									{product.stock > 0 ? (
										<span className="text-sm text-green-600">
											In Stock
										</span>
									) : (
										<span className="text-sm text-red-600">
											Out of Stock
										</span>
									)}
								</div>
							</Link>
						);
					})}
				</div>

				<div className="mt-12 text-center">
					<Link
						href={routes.shop.category}
						className="bg-accent hover:bg-accent/50 inline-flex items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white transition-colors duration-200"
					>
						View All Products

						<svg
							className="ml-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</Link>
				</div>
			</div>
		</div>
	);
}