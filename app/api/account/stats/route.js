import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Order from "@/models/order";
import product from "@/models/product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";


export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);
    
    // Convert to more usable format
    const statusStats = {
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
      return: 0
    };
    
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });
    
    return NextResponse.json(statusStats);
    
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch order stats" },
      { status: 500 }
    );
  }
}