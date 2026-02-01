import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const searchQuery = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const filter = {};
    
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    const sort = {};
    // Handle virtual field sorting
    if (sortBy === 'totalStock') {
      // For totalStock, we need to sort by the sum of variant stocks
      // This is a simplified approach - in production you might want to use aggregation
      sort.basePrice = sortOrder === 'desc' ? -1 : 1; // Fallback sort
    } else if (sortBy === 'unitsSold') {
      // For units sold, we need to consider both product.unitsSold and variant unitsSold
      sort.basePrice = sortOrder === 'desc' ? -1 : 1; // Fallback sort
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name'),
      
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching inventory' },
      { status: 500 }
    );
  }
}