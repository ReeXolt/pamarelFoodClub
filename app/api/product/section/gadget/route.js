import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import category from "@/models/category";

export async function GET() {
  try {
    await connectToDatabase();

    const gadgetProducts = await Product.find({ section: 'gadget' })
      .sort({ createdAt: -1 })
      .populate('category', 'name slug');

    const productsWithFormattedData = gadgetProducts.map(product => {
      // Calculate original price if there's a percentage off
      const originalPrice = product.percentOff > 0 
        ? product.price / (1 - product.percentOff / 100)
        : null;
      
      return {
        _id: product._id,
        name: product.name,
        price: product.basePrice,
        originalPrice: originalPrice ? Math.round(originalPrice) : null,
        images: product.images || [],
        rating: product.rating || 0,
        reviewCount: product.numReviews || 0,
        category: product.category,
        slug: product.slug,
        section: product.section,
        hasFlashSale: !!product.flashSale && 
                     new Date(product.flashSale.start) <= new Date() && 
                     new Date(product.flashSale.end) >= new Date()
      };
    });

    return NextResponse.json({
      success: true,
      products: productsWithFormattedData,
      count: productsWithFormattedData.length
    });

  } catch (error) {
    console.error("Error fetching gadget products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch gadget products" },
      { status: 500 }
    );
  }
}