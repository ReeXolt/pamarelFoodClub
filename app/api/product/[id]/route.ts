import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import Product from '@/models/product';
import { Types } from 'mongoose';

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

export async function GET(
	req: NextRequest,
	{ params }: RouteParams,
) {
	try {
		await connectToDatabase();

		const { id } = await params;

		// Validate product ID
		if (!id || id === 'undefined') {
			return NextResponse.json(
				{
					success: false,
					error: 'Product ID is required',
				},
				{ status: 400 },
			);
		}

		// Validate MongoDB ObjectId
		if (!Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid product ID',
				},
				{ status: 400 },
			);
		}

		const product = await Product.findById(id)
			.populate('category', 'name image slug')
			.lean();

		if (!product) {
			return NextResponse.json(
				{
					success: false,
					error: 'Product not found',
				},
				{ status: 404 },
			);
		}

		// Get related products
		const relatedProducts = await Product.find({
			category: product.category,
			_id: { $ne: id },
		})
			.populate('category', 'name slug')
			.limit(4)
			.select(
				`
          name
          images
          price
          sellingPrice
          ratings
          flashSale
          featured
          section
          stock
        `,
			)
			.lean();

		// Flash sale calculations
		const now = new Date();

		const isFlashSaleActive =
			product.flashSale?.active &&
			product.flashSale?.startDate &&
			product.flashSale?.endDate &&
			new Date(product.flashSale.startDate) <= now &&
			new Date(product.flashSale.endDate) >= now;

		let discountedPrice: number | null = null;

		if (
			isFlashSaleActive &&
			product.flashSale?.discountPercentage
		) {
			discountedPrice =
				product.price *
				(1 - product.flashSale.discountPercentage / 100);
		}

		return NextResponse.json({
			success: true,
			product: {
				...product,
				isFlashSaleActive,
				discountedPrice,
			},
			relatedProducts,
		});
	} catch (error: unknown) {
		console.error('Error fetching product:', error);

		if (
			error &&
			typeof error === 'object' &&
			'name' in error &&
			error.name === 'CastError'
		) {
			return NextResponse.json(
				{
					success: false,
					error: 'Invalid product ID',
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: 'Internal server error',
			},
			{ status: 500 },
		);
	}
}