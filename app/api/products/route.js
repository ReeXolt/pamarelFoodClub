import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import category from "@/models/category";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;


    // Build filter object
    const filter = {};

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Section filter
    const section = searchParams.get('section');
    if (section) {
      filter.section = section;
    }

    // Featured filter
    const featured = searchParams.get('featured');
    if (featured !== '') {
      filter.featured = featured === 'true';
    }

    // Flash sale filter
    const hasFlashSale = searchParams.get('hasFlashSale');
    if (hasFlashSale === 'active') {
      const now = new Date();
      filter['flashSale.active'] = true;
      filter['flashSale.startDate'] = { $lte: now };
      filter['flashSale.endDate'] = { $gte: now };
    } else if (hasFlashSale === 'inactive') {
      filter.$or = [
        { 'flashSale.active': false },
        { 'flashSale.active': { $exists: false } },
        { 
          'flashSale.active': true,
          $or: [
            { 'flashSale.startDate': { $gt: new Date() } },
            { 'flashSale.endDate': { $lt: new Date() } }
          ]
        }
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}