import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Review from "@/models/Review";
import Product from "@/models/product";

// GET /api/reviews/product/:id
export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get all reviews for this product, populate user info
    const reviews = await Review.find({ product: productId })
      .populate("user", "name email") // only show name/email
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        reviews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching reviews" },
      { status: 500 }
    );
  }
}
