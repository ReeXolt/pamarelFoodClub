'use client';

import React from 'react';
import { ProductDetailPage } from '@/components/productDetail';
import { useParams } from 'next/navigation';

export default function ProductDetailsPage() {
	const params = useParams();

	const productId =
		typeof params.id === 'string' ? params.id : (params.id?.[0] ?? '');

	return <ProductDetailPage productId={productId} />;
}
