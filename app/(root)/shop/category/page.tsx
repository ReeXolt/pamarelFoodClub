import { AllProducts } from '@/components/allProducts';
import { Suspense } from 'react';

export default function CategoryDisplay() {
	return (
		<Suspense fallback={<div>loading...</div>}>
			<AllProducts />
		</Suspense>
	);
}
