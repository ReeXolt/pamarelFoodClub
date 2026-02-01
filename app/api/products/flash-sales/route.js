import { NextResponse } from "next/server";
import Product from "@/models/product";
import connectToDatabase from "@/lib/dbConnect";

export async function GET() {
  try {

    await connectToDatabase();

    const now = new Date();

    // Get products with active flash sales that are currently running
    const flashSaleProducts = await Product.find({
      "flashSale.active": true,
      "flashSale.startDate": { $lte: now },
      "flashSale.endDate": { $gte: now }
    })
    .sort({ "flashSale.endDate": 1 }) // Sort by ending soonest
    .limit(8) // Get up to 8 products for carousel
    .populate('category', 'name')
    .lean();

    return NextResponse.json({ 
      success: true, 
      products: flashSaleProducts,
      currentTime: now.toISOString()
    });
  } catch (error) {
    console.error("Error fetching flash sales:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch flash sales" },
      { status: 500 }
    );
  }
}