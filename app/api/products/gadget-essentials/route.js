import { NextResponse } from "next/server";
import Product from "@/models/product";
import connectToDatabase from "@/lib/dbConnect";

export async function GET() {
  try {

    await connectToDatabase();

    // Get total count of gadget products
    const totalGadgetProducts = await Product.countDocuments({
      section: "gadget"
    });

    let products = [];

    if (totalGadgetProducts <= 4) {
      // If we have 4 or fewer products, return all of them
      products = await Product.find({
        section: "gadget"
      })
      .populate('category', 'name')
      .lean();
    } else {
      // Generate random skip value for pagination
      const randomSkip = Math.floor(Math.random() * (totalGadgetProducts - 4));
      
      // Get 4 random products using skip and limit
      products = await Product.find({
        section: "gadget"
      })
      .skip(randomSkip)
      .limit(4)
      .populate('category', 'name')
      .lean();
    }

    return NextResponse.json({ 
      success: true, 
      products: products 
    });
  } catch (error) {
    console.error("Error fetching gadget essentials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gadget essentials" },
      { status: 500 }
    );
  }
}