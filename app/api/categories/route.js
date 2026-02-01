import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/options";
import User from "@/models/user";
import Category from "@/models/category";

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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin" && user.role !== "seller") {
      return NextResponse.json({ error: "You are not authorized to create categories" }, { status: 403 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    if (!body.image) {
      return NextResponse.json({ error: "Category image is required" }, { status: 400 });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') } 
    });

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    // Create new category
    const newCategory = new Category({
      name: body.name.trim(),
      image: body.image
    });

    await newCategory.save();

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: newCategory
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function GET() {
  try {
    await connectToDatabase();
    
    const categories = await Category.find()
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}