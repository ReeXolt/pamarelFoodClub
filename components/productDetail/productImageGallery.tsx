'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Check } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/components/allProducts/data';
// import { ProductCategory } from '@/types/productTypes';

interface ProductImageGalleryProps {
	product: Product;
	discount: number;
}

export const ProductImageGallery = ({
	product,
	discount,
}: ProductImageGalleryProps) => {
	const [selectedImage, setSelectedImage] = useState(0);
	const [wishlisted, setWishlisted] = useState(false);
	const [shareTooltip, setShareTooltip] = useState(false);

	const handleShare = async () => {
		const productUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product._id}`;
		const shareText = `Check out ${product.name} on Pamarel Food Club`;

		// Try native share API first
		if (navigator.share) {
			try {
				await navigator.share({
					title: product.name,
					text: shareText,
					url: productUrl,
				});
			} catch (error) {
				// User cancelled share, do nothing
				console.log('Share cancelled');
			}
		} else {
			// Fallback to clipboard
			try {
				await navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
				setShareTooltip(true);
				setTimeout(() => setShareTooltip(false), 2000);
			} catch (error) {
				console.error('Failed to copy to clipboard:', error);
			}
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			className="sticky top-24"
		>
			{/* Main image */}
			<div className="relative rounded-xl border border-border overflow-hidden bg-card aspect-square max-h-100">
				<AnimatePresence mode="wait">
					<Image
						key={selectedImage}
						src={product.images[selectedImage]}
						alt={product.name}
						width={100}
						height={300}
						className="w-full h-full object-contain p-6"
					/>
				</AnimatePresence>
				{discount > 0 && (
					<span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-md">
						{discount}% OFF
					</span>
				)}
				<div className="absolute top-3 right-3 flex flex-col gap-2">
					<button
						onClick={() => setWishlisted(!wishlisted)}
						className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ${
							wishlisted
								? 'bg-destructive/10 text-destructive'
								: 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive'
						} border border-border/50`}
						title="Add to wishlist"
					>
						<Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
					</button>
					<div className="relative">
						<button
							onClick={handleShare}
							className="h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200"
							title="Share product"
						>
							{shareTooltip ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Share2 className="h-4 w-4" />
							)}
						</button>
						{shareTooltip && (
							<div className="absolute right-0 top-12 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
								Copied to clipboard!
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Thumbnails */}
			<div className="flex gap-2 mt-3">
				{product.images.map((img, i) => (
					<button
						key={i}
						onClick={() => setSelectedImage(i)}
						className={`h-16 w-16 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
							selectedImage === i
								? 'border-primary shadow-sm'
								: 'border-border hover:border-primary/40'
						}`}
					>
						<Image
							src={img}
							height={300}
							width={300}
							alt=""
							className="w-full h-full object-contain p-1"
						/>
					</button>
				))}
			</div>
		</motion.div>
	);
};
