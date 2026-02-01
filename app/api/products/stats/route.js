import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";


export async function GET() {
  try {
    await connectToDatabase();

    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: {
              $cond: [{ $gt: ['$stock', 0] }, 1, 0]
            }
          },
          totalSold: { $sum: '$numberSold' },
          totalRevenue: {
            $sum: {
              $multiply: ['$price', '$numberSold']
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      totalSold: 0,
      totalRevenue: 0
    };

    return NextResponse.json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}