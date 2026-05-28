'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, ArrowRight } from 'lucide-react';
import { Product } from '@/components/allProducts/data';
import { formatCurrency } from '@/components/section-cards';

// Related Products Component
export const RelatedProducts = ({ products }: { products: Product[] }) => {
	const router = useRouter();
	if (!products || products.length === 0) return null;

	return (
		<section className="mt-16">
			<div className="flex items-center justify-between mb-8">
				<h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
				<button className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium">
					View All
					<ArrowRight className="w-4 h-4" />
				</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{products.map((product) => (
					<div
						key={product._id}
						onClick={() => router.push(`/product/${product._id}`)}
						className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
					>
						<div className="aspect-square bg-gray-50 rounded-t-xl overflow-hidden relative">
							<Image
								src={product.images[0]}
								alt={product.name}
								unoptimized
								width={300}
								height={300}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							/>

							{/* Badges */}
							<div className="absolute top-2 left-2 flex flex-col gap-1">
								{product.featured && (
									<span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
										<Star className="w-3 h-3 fill-current" />
										Featured
									</span>
								)}
								{product.flashSale?.active && (
									<span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
										{product.flashSale.discountPercentage}% OFF
									</span>
								)}
							</div>
						</div>

						<div className="p-4">
							<h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
								{product.name}
							</h3>

							<div className="flex items-center gap-1 mb-2">
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										className={`w-3 h-3 ${
											star <= Math.floor(product.ratings?.average || 0)
												? 'text-yellow-400 fill-current'
												: 'text-gray-300'
										}`}
									/>
								))}
								<span className="text-xs text-gray-500 ml-1">
									({product.ratings?.count || 0})
								</span>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{product.flashSale?.active ? (
										<>
											<span className="text-lg font-bold text-red-600">
												{formatCurrency(
													product.price *
														(1 - product.flashSale.discountPercentage / 100),
												)}
											</span>
											<span className="text-sm text-gray-500 line-through">
												{formatCurrency(product.price)}
											</span>
										</>
									) : (
										<>
											<span className="text-xl font-bold text-green-600">
												₦{formatCurrency(product.sellingPrice)}
											</span>
											<span className="text-sm text-gray-500 line-through">
												₦{formatCurrency(product.price)}
											</span>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};
