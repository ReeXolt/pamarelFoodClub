import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import Category from "@/models/category";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Validate product ID
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate('category', 'name image')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id }
    })
      .populate('category', 'name')
      .limit(4)
      .select('name images price ratings flashSale featured')
      .lean();

    // Calculate if flash sale is active
    const now = new Date();
    const isFlashSaleActive = product.flashSale?.active && 
      new Date(product.flashSale.startDate) <= now && 
      new Date(product.flashSale.endDate) >= now;

    // Calculate discounted price if flash sale is active
    let discountedPrice = null;
    if (isFlashSaleActive && product.flashSale?.discountPercentage) {
      discountedPrice = product.price * (1 - product.flashSale.discountPercentage / 100);
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        isFlashSaleActive,
        discountedPrice
      },
      relatedProducts
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}