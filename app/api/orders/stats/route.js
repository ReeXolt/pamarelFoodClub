import connectToDatabase from "@/lib/dbConnect";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "../../auth/options";

export async function GET(request) {
  try {
    
    // Get current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = session.user.id; // Assuming user ID is stored in session

    await connectToDatabase();


    // Get total orders count for this user
    const totalOrders = await Order.countDocuments({ user: userId });

    // Get delivered orders count for this user
    const deliveredOrders = await Order.countDocuments({ 
      user: userId,
      orderStatus: 'delivered' 
    });

    // Get total spent by this user (sum of all their order totals)
    const totalSpentResult = await Order.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);

    const totalSpent = totalSpentResult[0]?.total || 0;

    return new Response(JSON.stringify({
      success: true,
      stats: {
        totalOrders,
        deliveredOrders,
        totalSpent
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch order statistics'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}