import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import Category from "@/models/category";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const categorySlug = searchParams.get('category');


    // First get all active categories if no specific category is requested
    let categories = await Category.find({ isActive: true })
      .select('name slug')
      .lean();

    if (!categorySlug) {
      const productsByCategory = await Promise.all(
        categories.map(async (category) => {
          const products = await Product.find({ 
            category: category._id,
            // section: { $in: ['food', 'gadget'] }
          })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('name slug price percentOff images rating numReviews flashSale category')
          .populate('category', 'name slug')
          .lean();

          return {
            category: {
              name: category.name,
              slug: category.slug
            },
            products: products.map(product => ({
              ...product,
              discountPrice: product.percentOff > 0 
                ? product.price * (1 - product.percentOff / 100)
                : null,
              hasFlashSale: !!product.flashSale && 
                new Date(product.flashSale.start) <= new Date() && 
                new Date(product.flashSale.end) >= new Date()
            }))
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: productsByCategory
      });
    } else {
      // If specific category requested, return only products from that category
      const category = await Category.findOne({ 
        slug: categorySlug,
        isActive: true 
      });

      if (!category) {
        return NextResponse.json(
          { success: false, message: "Category not found" },
          { status: 404 }
        );
      }

      const products = await Product.find({ 
        category: category._id,
        // section: { $in: ['food', 'gadget'] }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name slug price percentOff images rating numReviews flashSale category')
      .populate('category', 'name slug')
      .lean();

      const productsWithDiscount = products.map(product => ({
        ...product,
        discountPrice: product.percentOff > 0 
          ? product.price * (1 - product.percentOff / 100)
          : null,
        hasFlashSale: !!product.flashSale && 
                     new Date(product.flashSale.start) <= new Date() && 
                     new Date(product.flashSale.end) >= new Date()
      }));

      return NextResponse.json({
        success: true,
        data: {
          category: {
            name: category.name,
            slug: category.slug
          },
          products: productsWithDiscount
        }
      });
    }

  } catch (error) {
    console.error("Error fetching deals by category:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch deals by category" },
      { status: 500 }
    );
  }
}