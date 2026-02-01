import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";

export async function GET(request) {
  try {
    await connectToDatabase();

    const now = new Date();
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');

    const [products, total] = await Promise.all([
      Product.find({
        "flashSale.start": { $lte: now },
        "flashSale.end": { $gte: now }
      })
      .sort({ "flashSale.discountPercent": -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name slug'),

      Product.countDocuments({
        "flashSale.start": { $lte: now },
        "flashSale.end": { $gte: now }
      })
    ]);


    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        ...product.toObject(),
        discountPrice: calculateDiscountPrice(product.price, product.flashSale.discountPercent),
        timeLeft: getTimeRemaining(product.flashSale.end)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Flash sale products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flash sale products" },
      { status: 500 }
    );
  }
}

// Reuse helper functions from index.ts
function calculateDiscountPrice(originalPrice, discountPercent) {
  return originalPrice * (1 - discountPercent / 100);
}

function getTimeRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}