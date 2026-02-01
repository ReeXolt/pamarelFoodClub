import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import Category from "@/models/category";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    
    // Extract all possible filter parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;
    
    const search = searchParams.get('search');
    const categorySlug = searchParams.get('category');
    const sections = searchParams.get('sections');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const minDiscount = searchParams.get('minDiscount');
    const sort = searchParams.get('sort') || 'popular';
    const featured = searchParams.get('featured');

    // Build the filter object
    const filter = {};

    // Search filter (search in name, description, and tags)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter (using slug to find category ID)
    if (categorySlug) {
      const categorySlugs = categorySlug.split(',');
      // Find all categories matching the slugs
      const categories = await Category.find({ 
        name: { $in: categorySlugs.map(slug => new RegExp(`^${slug}$`, 'i')) } 
      });
      
      if (categories.length > 0) {
        filter.category = { $in: categories.map(cat => cat._id) };
      }
    }

    // Section filter
    if (sections) {
      const sectionArray = sections.split(',');
      filter.section = { $in: sectionArray };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      filter['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    // Discount filter (for flash sales)
    if (minDiscount) {
      filter['flashSale.active'] = true;
      filter['flashSale.discountPercentage'] = { $gte: parseInt(minDiscount) };
    }

    // Featured filter
    if (featured) {
      filter.featured = featured === 'true';
    }

    // Build sort object
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { numberSold: -1, 'ratings.average': -1 };
        break;
      case 'best-rated':
        sortOptions = { 'ratings.average': -1, 'ratings.count': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'price-low-high':
        sortOptions = { price: 1 };
        break;
      case 'price-high-low':
        sortOptions = { price: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Execute query with population
    const products = await Product.find(filter)
      .populate('category', 'name image')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        search,
        category: categorySlug,
        sections: sections ? sections.split(',') : [],
        priceRange: {
          min: minPrice ? parseFloat(minPrice) : null,
          max: maxPrice ? parseFloat(maxPrice) : null
        },
        minRating: minRating ? parseFloat(minRating) : null,
        minDiscount: minDiscount ? parseInt(minDiscount) : null,
        sort,
        featured: featured ? featured === 'true' : null
      }
    });

  } catch (error) {
    console.error('Error filtering products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint for complex filtering
export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      page = 1,
      limit = 12,
      search,
      category,
      sections = [],
      priceRange = {},
      minRating,
      minDiscount,
      sort = 'popular',
      featured,
      tags = []
    } = body;

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      let categoryFilter = {};
      
      // Handle comma-separated string or array
      const categoryInput = Array.isArray(category) ? category : category.split(',');
      
      const categoryIds = [];
      const categorySlugs = [];

      categoryInput.forEach(cat => {
        if (mongoose.Types.ObjectId.isValid(cat)) {
          categoryIds.push(cat);
        } else {
          categorySlugs.push(cat);
        }
      });

      if (categorySlugs.length > 0) {
          const categories = await Category.find({ 
             name: { $in: categorySlugs.map(slug => new RegExp(`^${slug}$`, 'i')) } 
          });
          categories.forEach(cat => categoryIds.push(cat._id));
      }
      
      if (categoryIds.length > 0) {
          filter.category = { $in: categoryIds };
      }
    }

    // Section filter
    if (sections.length > 0) {
      filter.section = { $in: sections };
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filter.price = {};
      if (priceRange.min) filter.price.$gte = parseFloat(priceRange.min);
      if (priceRange.max) filter.price.$lte = parseFloat(priceRange.max);
    }

    // Rating filter
    if (minRating) {
      filter['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    // Discount filter
    if (minDiscount) {
      filter['flashSale.active'] = true;
      filter['flashSale.discountPercentage'] = { $gte: parseInt(minDiscount) };
    }

    // Featured filter
    if (featured !== undefined) {
      filter.featured = featured;
    }

    // Tags filter
    if (tags.length > 0) {
      filter.tags = { $in: tags.map(tag => new RegExp(tag, 'i')) };
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { numberSold: -1, 'ratings.average': -1 };
        break;
      case 'best-rated':
        sortOptions = { 'ratings.average': -1, 'ratings.count': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'price-low-high':
        sortOptions = { price: 1 };
        break;
      case 'price-high-low':
        sortOptions = { price: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name image')
      .sort(sortOptions)
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
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in POST products filter:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}