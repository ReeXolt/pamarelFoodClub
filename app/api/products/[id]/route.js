import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import User from "@/models/user";
import category from "@/models/category";


export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const product = await Product.findById(id).populate('category', 'name image');

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    if (user.role !== "admin" && user.role !== "seller") {
      return NextResponse.json({ error: "You are not authorized to update products" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (body.price !== undefined && body.price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (body.sellingPrice !== undefined && body.sellingPrice < 0) {
      return NextResponse.json(
        { error: "Selling Price must be a positive number" },
        { status: 400 }
      );
    }

    if (body.stock !== undefined && body.stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a positive number" },
        { status: 400 }
      );
    }

    // Validate section enum if provided
    if (body.section && !['food', 'gadget'].includes(body.section)) {
      return NextResponse.json(
        { error: "Section must be either 'food' or 'gadget'" },
        { status: 400 }
      );
    }

    // Validate flash sale data if provided
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

    // Prepare update data
    const updateData = { ...body };

    // Clean up undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name image');

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(', ')}` },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A product with similar details already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "You are not authorized to delete products" }, { status: 403 });
    }

    const { id } = await params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting product:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}