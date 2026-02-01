import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import User from "@/models/user";
import category from "@/models/category";


export async function GET() {
  try {
    await connectToDatabase();
    
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get all upcoming and active flash sales
    const now = new Date();
    const flashSales = await Product.find({
      "flashSale.end": { $gte: now }
    })
    .sort({ "flashSale.start": 1 })
    .populate('category', 'name slug')
    // .select('name slug price flashSale images');

    return NextResponse.json({
      success: true,
      flashSales: flashSales.map(product => ({
        ...product.toObject(),
        status: getFlashSaleStatus(product.flashSale, now),
        discountPrice: calculateDiscountPrice(product.price, product.flashSale.discountPercent)
      }))
    });

  } catch (error) {
    console.error("Manage flash sales error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flash sales" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Remove flash sale from product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $unset: { flashSale: 1 } },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Flash sale removed successfully"
    });

  } catch (error) {
    console.error("Delete flash sale error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove flash sale" },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateDiscountPrice(originalPrice, discountPercent) {
  return originalPrice * (1 - discountPercent / 100);
}

function getFlashSaleStatus(flashSale, now) {
  if (now < flashSale.start) return "upcoming";
  if (now > flashSale.end) return "ended";
  return "active";
}