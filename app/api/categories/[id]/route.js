import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Category from "@/models/category";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import User from "@/models/user";
import Product from "@/models/product";

export async function PUT(req, { params }) {
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

    if (user.role !== "admin") {
      return NextResponse.json({ error: "You are not authorized to update categories" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    if (!body.image) {
      return NextResponse.json({ error: "Category image is required" }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category name already exists (excluding current category)
    const duplicateCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') },
      _id: { $ne: id }
    });

    if (duplicateCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: body.name.trim(),
        image: body.image
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory
    });

  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
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
      return NextResponse.json({ error: "You are not authorized to delete categories" }, { status: 403 });
    }

    const { id } = await params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category is being used by any products
    const productsUsingCategory = await Product.findOne({ category: id });
    if (productsUsingCategory) {
      return NextResponse.json({ 
        error: "Cannot delete category. It is being used by one or more products." 
      }, { status: 400 });
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting category:', error);

    if (error.name === 'CastError') {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}