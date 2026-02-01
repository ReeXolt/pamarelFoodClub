import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import { NextResponse } from "next/server";
import Product from "@/models/product";
import Category from "@/models/category";

export async function GET(req, { params }) {
    try {
        // Connect to database
        await connectToDatabase();

        const { id } = await params;

        // Verify admin session
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(session.user.id);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        // Get product by ID with variants
        const product = await Product.findById(id).populate('category');
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }


        return NextResponse.json({ product }, { status: 200 });

    } catch (error) {
        console.error("Product fetch error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function PUT(req, { params }) {
    try {
        // Connect to database
        await connectToDatabase();

        const { id } = await params;

        // Verify admin session
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(session.user.id);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        // Parse the request body
        const payload = await req.json();
        const { product: productData, category: categoryData } = payload;

        // Validate required fields
        if (!productData || !categoryData) {
            return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
        }

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Check if category exists or create new one
        let categoryDoc = await Category.findOne({ name: categoryData.name });
        if (!categoryDoc) {
            // Create new category
            categoryDoc = new Category({
                name: categoryData.name,
                slug: categoryData.name.toLowerCase().replace(/ /g, '-'),
                description: categoryData.description,
                image: {
                    url: categoryData.image,
                    publicId: `category-${Date.now()}`
                },
            });
            await categoryDoc.save();
        }

        // Process product images
        const productImages = productData.images.map((img, index) => ({
            url: img,
            publicId: `product-${Date.now()}-${index}`,
            isDefault: index === 0,
            altText: productData.name
        }));

        // Process variants - handle both Map and object combinations
        const processedVariants = productData.variants.map((variant, index) => {
            let combination;
            if (variant.combination instanceof Map) {
                combination = new Map(variant.combination);
            } else {
                combination = new Map(Object.entries(variant.combination || {}));
            }

            return {
                combination,
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku || `SKU-${Date.now()}-${index}`,
                image: variant.image ? {
                    url: variant.image,
                    publicId: `variant-${Date.now()}-${index}`
                } : undefined
            };
        });

        // Update the product with new schema
        existingProduct.name = productData.name;
        existingProduct.slug = productData.name.toLowerCase().replace(/ /g, '-');
        existingProduct.description = productData.description;
        existingProduct.category = categoryDoc._id;
        existingProduct.section = productData.section;
        existingProduct.specifications = productData.specifications || [];
        existingProduct.images = productImages;
        existingProduct.basePrice = productData.basePrice || 0;
        existingProduct.variantTypes = productData.variantTypes || [];
        existingProduct.variants = processedVariants;
        existingProduct.tags = productData.tags || [];
        existingProduct.isTopDeal = productData.isTopDeal || false;
        existingProduct.isFeatured = productData.isFeatured || false;
        
        if (productData.flashSale) {
            existingProduct.flashSale = {
                start: new Date(productData.flashSale.start),
                end: new Date(productData.flashSale.end),
                discountPercent: productData.flashSale.discountPercent
            };
        } else {
            existingProduct.flashSale = undefined;
        }

        await existingProduct.save();

        // Populate the category in the response
        await existingProduct.populate('category');

        return NextResponse.json({
            success: true,
            product: existingProduct,
            category: categoryDoc
        }, { status: 200 });

    } catch (error) {
        console.error("Product update error:", error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json(
                { error: `A product with this ${field} already exists` },
                { status: 400 }
            );
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { error: "Validation failed", details: errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        // Connect to database
        await connectToDatabase();

        const { id } = await params;

        // Verify admin session
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(session.user.id);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        // Delete product
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("Product delete error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}