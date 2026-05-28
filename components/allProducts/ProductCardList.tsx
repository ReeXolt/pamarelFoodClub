'use client';
import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { routes } from '@/utils/routes';
import { Product } from './data';
import { StarRating } from '@/components/ui/StarRating';

const ProductCardListComponent = ({
	product,
	index,
}: {
	product: Product;
	index: number;
}) => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-40px' });	
	const discount = product.flashSale?.discountPercentage ?? 0;
	const discountedPrice = product.price * (1 - discount / 100);

	return (
		<Link href={routes.shop.product(product._id.toString())} className="block">
			<motion.div
				ref={ref}
				initial={{ opacity: 0, x: 30 }}
				animate={isInView ? { opacity: 1, x: 0 } : {}}
				transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
				className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex"
			>
				<div className="relative w-36 sm:w-48 shrink-0 overflow-hidden bg-background">
					{product.images && product.images.length > 0 ? (
						<Image
							src={product.images[0]}
							alt={product.name}
							fill
							className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-muted">
							<span className="text-muted-foreground text-xs">No Image</span>
						</div>
					)}
					{product.featured && (
						<span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[9px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
							<Star className="h-2.5 w-2.5" /> Featured
						</span>
					)}
					{product.flashSale && product.flashSale.active && product.flashSale.discountPercentage && (

						<span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
							{product.flashSale.discountPercentage}% OFF
						</span>
					)}
				</div>
				<div className="flex-1 p-4 flex flex-col justify-between min-w-0">
					<div>
						<h4 className="text-sm font-semibold text-foreground mb-1.5">
							{product.name}
						</h4>
						<div className="mb-2">
							{product.ratings.average > 0 && (
								<StarRating rating={product.ratings.average} reviews={product.ratings.count} size="sm" />
							)}
						</div>
						<div className="flex gap-1.5 mb-2">
							<Badge
								variant="secondary"
								className="text-[10px] font-medium px-2 py-0.5"
							>
								{product.category.name}
							</Badge>
							{product.category.slug && (
								<Badge
									variant="outline"
									className="text-[10px] font-medium px-2 py-0.5"
								>
									{product.category.slug}
								</Badge>
							)}
						</div>
					</div>
					<div className="flex items-center justify-between">
						{product.flashSale?.active ? (
							<>
								<span className="text-lg font-bold text-red-600">
									{discountedPrice.toLocaleString()}
								</span>

								<span className="text-sm text-gray-500 line-through">
									{product.price.toLocaleString()}
								</span>
							</>
						) : (
							<>
								<span className="text-lg font-bold text-green-600">
									{formatPrice(product.sellingPrice)}
								</span>

								<span className="text-sm text-gray-500 line-through">
									{formatPrice(product.price)}
								</span>
							</>
						)}
					</div>
					<div className="flex items-center justify-between gap-1 text-xs">
						{product.section && (
							<Badge
								variant="secondary"
								className="text-[10px] font-medium px-2 py-0.5"
							>
								{product.section}
							</Badge>
						)}
						{product.category.name && (
							<Badge
								variant="outline"
								className="text-[10px] font-medium px-2 py-0.5 ml-auto"
							>
								{product.category.name}
							</Badge>
						)}
					</div>
				</div>
			</motion.div>
		</Link>
	);
};

export const ProductCardList = memo(ProductCardListComponent);
