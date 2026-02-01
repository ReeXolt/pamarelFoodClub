import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/options";
import connectToDatabase from "@/lib/dbConnect";
import Order from "@/models/order";


export async function GET() {
  const session = await getServerSession(authOptions);

  
  if (!session) {
    return new Response(JSON.stringify({
      success: false,
      message: "Unauthorized"
    }), { status: 401 });
  }

  try {
    // Find delivered orders with items not yet reviewed
    await connectToDatabase();
    const orders = await Order.find({
      user: session.user.id,
      orderStatus: 'delivered',
      'items.isReviewed': false
    }).select('_id items');


    // Format the response
    const pendingReviews = orders.flatMap(order => 
      order.items
        .filter(item => !item.isReviewed)
        .map(item => ({
          orderId: order._id,
          itemId: item._id,
          product: {
            id: item.product,
            name: item.name,
            imageUrl: item.imageUrl
          }
        }))
    );

    return new Response(JSON.stringify({
      success: true,
      pendingReviews
    }), { status: 200 });

  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Internal server error"
    }), { status: 500 });
  }
}