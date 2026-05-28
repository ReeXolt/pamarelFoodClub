import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

type ProductErrorProps = {
	error: string | null;
};

export default function ProductError({ error }: ProductErrorProps) {
	const router = useRouter();
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<span className="text-2xl">😔</span>
				</div>
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Product Not Found
				</h1>
				<p className="text-gray-600 mb-6">
					{error || 'The product you are looking for does not exist.'}
				</p>
				<button
					onClick={() => router.push('/')}
					className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-2 mx-auto"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Home
				</button>
			</div>
		</div>
	);
}
