import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import User from "@/models/user";
import Product from "@/models/product";
import Category from "@/models/category";


const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid User" }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user exists and has appropriate role
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is admin or seller (adjust based on your role system)
    if (user.role !== "admin" && user.role !== "seller") {
      return NextResponse.json({ error: "You are not authorized to upload products" }, { status: 403 });
    }

    const body = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'section', 'category', 'price', 'images', "discountPercentage"];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate section enum
    if (!['food', 'gadget'].includes(body.section)) {
      return NextResponse.json(
        { error: "Section must be either 'food' or 'gadget'" },
        { status: 400 }
      );
    }

    // Validate price
    if (body.price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Validate stock
    if (body.stock && body.stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a positive number" },
        { status: 400 }
      );
    }

    // Validate category exists
    const categoryExists = await Category.findById(body.category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Validate flash sale data if active
    if (body.flashSale?.active) {
      if (!body.flashSale.discountPercentage || body.flashSale.discountPercentage < 0 || body.flashSale.discountPercentage > 100) {
        return NextResponse.json(
          { error: "Discount percentage must be between 0 and 100 when flash sale is active" },
          { status: 400 }
        );
      }

      if (!body.flashSale.startDate || !body.flashSale.endDate) {
        return NextResponse.json(
          { error: "Start date and end date are required when flash sale is active" },
          { status: 400 }
        );
      }

      const startDate = new Date(body.flashSale.startDate);
      const endDate = new Date(body.flashSale.endDate);

      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "Flash sale end date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Validate variants structure
    if (body.variants && Array.isArray(body.variants)) {
      for (const variant of body.variants) {
        if (!variant.name || !variant.options || !Array.isArray(variant.options) || variant.options.length === 0) {
          return NextResponse.json(
            { error: "Each variant must have a name and at least one option" },
            { status: 400 }
          );
        }
      }
    }

    // Validate images array
    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }

    // Create product data object
    const productData = {
      name: body.name.trim(),
      description: body.description?.trim() || '',
      section: body.section,
      category: body.category,
      price: parseFloat(body.price),
      sellingPrice: body.price * (1 - body.discountPercentage / 100),
      slug: createSlug(body.name.trim()),
      images: body.images,
      stock: body.stock ? parseInt(body.stock) : 0,
      featured: Boolean(body.featured),
      tags: body.tags && Array.isArray(body.tags) ? body.tags : [],
      variants: body.variants && Array.isArray(body.variants) ? body.variants : [],
    };

    // Add flash sale data if provided
    if (body.flashSale) {
      productData.flashSale = {
        active: Boolean(body.flashSale.active),
        discountPercentage: body.flashSale.discountPercentage ? parseFloat(body.flashSale.discountPercentage) : 0,
        startDate: body.flashSale.startDate ? new Date(body.flashSale.startDate) : null,
        endDate: body.flashSale.endDate ? new Date(body.flashSale.endDate) : null,
      };
    }

    // Create new product
    const newProduct = new Product(productData);
    await newProduct.save();

    // Populate the category field for the response
    await newProduct.populate('category', 'name image');

    return NextResponse.json(
      {
        success: true,
        message: "Product uploaded successfully",
        product: newProduct
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error uploading product:', error);

    // Handle duplicate key errors (unique constraints)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A product with similar details already exists" },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to fetch products (if needed)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate('category', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();

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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}