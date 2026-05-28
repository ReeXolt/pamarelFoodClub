'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ProductImageGallery } from './productImageGallery';
import { ProductHeader } from './productHeader';
import { ProductPricing } from './productPricing';
import { ProductQuantityCart } from './productQuantityCart';
import { ProductTrustBadges } from './productTrustBadges';
import { ProductDetailsTabs } from './productDetailsTabs';
import { useCartStore } from '@/stores/cart-store';
import { SelectedVariants, VariantType } from '@/models/product';
import { Product } from '@/components/allProducts/data';
import ProductError from '@/components/reuseables/loadingState/ProductError';
import Spinner from '@/components/reuseables/loadingState/Spinner';
import { RelatedProducts } from './relatedProducts';
import { VariantSelector } from './variantSelector';

export const ProductDetailPage = ({ productId }: { productId: string }) => {
	const router = useRouter();

	const [product, setProduct] = useState<Product | null>(null);
	const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>(
		{},
	);

	const { addItem, getItemQuantity } = useCartStore();

	// Fetch product data
	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(`/api/products/${productId}`);
				const data = await response.json();

				if (data.success) {
					setProduct(data.product);
					setRelatedProducts(data.relatedProducts || []);

					// Initialize selected variants
					if (data.product.variants) {
						const initialVariants: SelectedVariants = {};

						data.product.variants.forEach((variant: VariantType) => {
							initialVariants[variant.name] = variant.options[0];
						});
						setSelectedVariants(initialVariants);
					}
				} else {
					setError(data.error || 'Product not found');
				}
			} catch (error) {
				console.error('Error fetching product:', error);
				setError('Failed to load product');
			} finally {
				setLoading(false);
			}
		};

		if (productId) {
			fetchProduct();
		}
	}, [productId]);

	const handleVariantChange = (_variantName: string, _options: string[]) => {
		setSelectedVariants((prev) => ({
			...prev,
			[_variantName]: _options[0], // Default to the first option for now
		}));
	};

	const handleAddToCart = () => {
		if (!product) return;

		addItem(product, quantity, selectedVariants);

		// Optional: Open cart slider after adding
		// You might want to pass a ref or use a global state to control the cart slider
	};

	if (loading) return <Spinner />;

	if (error || !product) return <ProductError error={error} />;

	const discount = product.sellingPrice
		? Math.round(
				((product.sellingPrice - product.price) / product.sellingPrice) * 100,
			)
		: 0;

	return (
		<div className="min-h-screen bg-background">
			{/* Back button */}
			<div className="mx-auto max-w-7xl px-4 lg:px-8 pt-4">
				<button
					onClick={() => router.back()}
					className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-4 w-4" /> Back
				</button>
			</div>

			{/* Main Product Section */}
			<section className="mx-auto max-w-7xl px-4 lg:px-8 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
					{/* Left: Image gallery */}
					<div className="lg:col-span-5">
						<ProductImageGallery product={product} discount={discount} />
					</div>

					{/* Right: Product info */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1 }}
						className="lg:col-span-7 flex flex-col"
					>
						<ProductHeader product={product} />
						<ProductPricing product={product} />
						<VariantSelector
							variants={product.variants}
							selectedVariant={selectedVariants}
							onVariantChange={handleVariantChange}
						/>
						<ProductQuantityCart
							product={product}
							quantity={quantity}
							handleAddToCart={handleAddToCart}
							onQuantityChange={setQuantity}
						/>
						<ProductTrustBadges />
						<ProductDetailsTabs product={product} productId={productId} />
					</motion.div>
				</div>
			</section>

			<RelatedProducts products={relatedProducts} />
		</div>
	);
};
