import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/options";
import connectToDatabase from "@/lib/dbConnect";
import Order from "@/models/order";
import Review from "@/models/Review";
import Product from "@/models/product";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response(JSON.stringify({
      success: false,
      message: "Unauthorized"
    }), { status: 401 });
  }

  try {
    const { orderId, itemId, productId, rating, comment } = await req.json();



    // Validate input
    if (!orderId || !itemId || !productId || !rating) {
      return new Response(JSON.stringify({
        success: false,
        message: "Missing required fields"
      }), { status: 400 });
    }

    await connectToDatabase();

    // Check if order exists and is delivered
    const order = await Order.findOne({
      _id: orderId,
      user: session.user.id,
      orderStatus: 'delivered'
    });


    if (!order) {
      return new Response(JSON.stringify({
        success: false,
        message: "Order not found or not delivered"
      }), { status: 404 });
    }



    // Find the specific item in the order
    const orderItem = order.items.id(itemId);
    if (!orderItem) {
      return new Response(JSON.stringify({
        success: false,
        message: "Item not found in order"
      }), { status: 404 });
    }

    // Check if already reviewed
    if (orderItem.isReviewed) {
      return new Response(JSON.stringify({
        success: false,
        message: "This item has already been reviewed"
      }), { status: 400 });
    }

    // Create the review
    const review = new Review({
      user: session.user.id,
      product: productId,
      order: orderId,
      rating,
      comment,
      isVerifiedPurchase: true
    });

    await review.save();

    // Mark item as reviewed
    orderItem.isReviewed = true;
    await order.save();


    return new Response(JSON.stringify({
      success: true,
      message: "Review submitted successfully"
    }), { status: 200 });

  } catch (error) {
    console.error("Review submission error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Internal server error"
    }), { status: 500 });
  }
}