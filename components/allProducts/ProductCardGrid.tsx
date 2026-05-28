'use client';
import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { routes } from '@/utils/routes';
import { Product } from './data';
import { StarRating } from '@/components/ui/StarRating';

const ProductCardGridComponent = ({
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
				initial={{ opacity: 0, y: 30 }}
				animate={isInView ? { opacity: 1, y: 0 } : {}}
				transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
				className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
			>
				<div className="relative h-48 overflow-hidden bg-background">
					{product.images ? (
						<Image
							src={product.images[0]}
							alt={product.name}
							fill
							className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
							loading="lazy"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-muted">
							<span className="text-muted-foreground">No Image</span>
						</div>
					)}
					{product.featured && (
						<span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-md flex items-center gap-1">
							<Star className="h-3 w-3" /> Featured
						</span>
					)}
					{product.flashSale?.active && (
						<span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-md">
							{product.flashSale.discountPercentage}% OFF
						</span>
					)}
					<div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
				</div>
				<div className="p-4">
					<h4 className="text-sm font-semibold text-foreground leading-tight mb-2 min-h-10 line-clamp-2">
						{product.name}
					</h4>
					<div className="mb-2">
						{product.ratings.average > 0 && (
							<StarRating
								rating={product.ratings.average}
								reviews={product.ratings.count}
								size="sm"
							/>
						)}
					</div>
					<div className="flex items-baseline gap-2 mb-2">
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
					<div className="flex items-center justify-between">
						{product.section && (
							<Badge
								variant="secondary"
								className="text-[10px] font-medium px-2 py-0.5"
							>
								{product.section}
							</Badge>
						)}
						{product.category && (
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

export const ProductCardGrid = memo(ProductCardGridComponent);
