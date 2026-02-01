import { NextResponse } from "next/server";
import Product from "@/models/product";
import connectToDatabase from "@/lib/dbConnect";

export async function GET() {
  try {

    await connectToDatabase();

    
    // Get total count of food products
    const totalFoodProducts = await Product.countDocuments({
      section: "food"
    });

    let products = [];

    if (totalFoodProducts <= 4) {
      // If we have 4 or fewer products, return all of them
      products = await Product.find({
        section: "food"
      })
      .populate('category', 'name')
      .lean();
    } else {
      // Get 4 random food products using aggregation with sample
      products = await Product.aggregate([
        { $match: { section: "food" } },
        { $sample: { size: 4 } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: 1,
            description: 1,
            slug: 1,
            section: 1,
            price: 1,
            images: 1,
            variants: 1,
            stock: 1,
            numberSold: 1,
            featured: 1,
            flashSale: 1,
            tags: 1,
            ratings: 1,
            createdAt: 1,
            updatedAt: 1,
            'category.name': 1
          }
        }
      ]);
    }

    return NextResponse.json({ 
      success: true, 
      products: products 
    });
  } catch (error) {
    console.error("Error fetching food essentials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch food essentials" },
      { status: 500 }
    );
  }
}