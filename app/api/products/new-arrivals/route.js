import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import category from "@/models/category";

export async function GET() {
  try {

    await connectToDatabase

    // Get the 4 most recently created products
    const newArrivals = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('category', 'name')
      .lean();

    // If we have less than 4 products, get some featured products to fill the gap
    if (newArrivals.length < 4) {
      const featuredProducts = await Product.find({ 
        _id: { $nin: newArrivals.map(p => p._id) },
        featured: true 
      })
      .limit(4 - newArrivals.length)
      .populate('category', 'name')
      .lean();

      newArrivals.push(...featuredProducts);
    }

    // If we still don't have 4 products, get any products to fill the remaining spots
    if (newArrivals.length < 4) {
      const additionalProducts = await Product.find({ 
        _id: { $nin: newArrivals.map(p => p._id) }
      })
      .limit(4 - newArrivals.length)
      .populate('category', 'name')
      .lean();

      newArrivals.push(...additionalProducts);
    }

    return NextResponse.json({ success: true, products: newArrivals });
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch new arrivals" },
      { status: 500 }
    );
  }
}