import category from "@/models/category";
import connectToDatabase from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import product from "@/models/product";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Get all categories
    const categories = await category.find({})
      .skip(skip)
      .limit(limit)
      .lean();

    // Get product counts per category
    const counts = await product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      productCount: countMap.get(cat._id.toString()) || 0
    }));

    // Get total count for pagination
    const totalCategories = await category.countDocuments();

    return NextResponse.json({
      message: categoriesWithCounts,
      pagination: {
        total: totalCategories,
        page,
        limit,
        totalPages: Math.ceil(totalCategories / limit)
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "something went wrong" }, { status: 500 });
  }
}
