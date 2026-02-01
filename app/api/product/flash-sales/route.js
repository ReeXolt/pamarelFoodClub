import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import User from "@/models/user";
import category from "@/models/category";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";

export async function GET(req) {
  try {
    await connectToDatabase();

    // Get current active flash sales
    const now = new Date();
    const flashSaleProducts = await Product.find({
      "flashSale.start": { $lte: now },
      "flashSale.end": { $gte: now }
    })
    .sort({ "flashSale.discountPercent": -1 })
    .limit(10)
    .populate('category', 'name slug')
    // .select('name slug price percentOff flashSale images rating numReviews');

    if (!flashSaleProducts.length) {
      return NextResponse.json({
        success: true,
        message: "No active flash sales currently",
        products: []
      });
    }

    return NextResponse.json({
      success: true,
      products: flashSaleProducts.map(product => ({
        ...product.toObject(),
        discountPrice: calculateDiscountPrice(product.price, product.flashSale.discountPercent),
        timeLeft: getTimeRemaining(product.flashSale.end)
      }))
    });

  } catch (error) {
    console.error("Flash sales error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flash sales" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
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

    const { productId, startDate, endDate, discountPercent } = await req.json();

    // Validate input
    if (!productId || !startDate || !endDate || discountPercent === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: "Discount must be between 1-100%" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    // Update product with flash sale
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          flashSale: {
            start,
            end,
            discountPercent
          }
        }
      },
      { new: true }
    ).populate('category', 'name slug');

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...updatedProduct.toObject(),
        discountPrice: calculateDiscountPrice(updatedProduct.price, discountPercent),
        timeLeft: getTimeRemaining(end)
      }
    });

  } catch (error) {
    console.error("Create flash sale error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create flash sale" },
      { status: 500 }
    );
  }
}

// Helper functions
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