import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import User from '@/models/user';
import Product from '@/models/product';
import connectToDatabase from '@/lib/dbConnect';


export async function GET(req) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const rating = searchParams.get('rating');
    const searchQuery = searchParams.get('search');
    
    // Build query
    const query = {};
    
    if (rating && !isNaN(rating)) {
      query.rating = parseInt(rating);
    }
    
    if (searchQuery) {
      query.$or = [
        { comment: { $regex: searchQuery, $options: 'i' } },
        { 'user.name': { $regex: searchQuery, $options: 'i' } },
        { 'product.name': { $regex: searchQuery, $options: 'i' } }
      ];
    }

    await connectToDatabase();
    
    // Get reviews with populated user and product data
    const reviews = await Review.find(query)
      .populate('user', 'name email', User)
      .populate('product', 'name images', Product)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Review.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review._id,
        user: {
          name: review.user.name,
          email: review.user.email
        },
        product: {
          id: review.product._id,
          name: review.product.name,
          image: review.product.images[0]?.url || ''
        },
        rating: review.rating,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}