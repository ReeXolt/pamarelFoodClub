import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Product from "@/models/product";
import Category from "@/models/category";
import mongoose from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption =
  | "popular"
  | "best-rated"
  | "newest"
  | "price-low-high"
  | "price-high-low";

type SortQuery = Record<string, 1 | -1>;

interface PriceFilter {
  $gte?: number;
  $lte?: number;
}

interface RatingFilter {
  $gte: number;
}

interface CategoryFilter {
  $in: mongoose.Types.ObjectId[];
}

interface SectionFilter {
  $in: string[];
}

interface SearchFilter {
  $or: Array<
    | { name: { $regex: RegExp } }
    | { description: { $regex: RegExp } }
    | { tags: { $in: RegExp[] } }
  >;
}

interface ProductFilter {
  $or?: SearchFilter["$or"];
  category?: CategoryFilter;
  section?: SectionFilter;
  price?: PriceFilter;
  "ratings.average"?: RatingFilter;
  "flashSale.active"?: boolean;
  "flashSale.discountPercentage"?: { $gte: number };
  featured?: boolean;
  tags?: { $in: RegExp[] };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface GetResponseBody {
  success: true;
  products: unknown[];
  pagination: PaginationInfo;
  filters: {
    search: string | null;
    category: string | null;
    sections: string[];
    priceRange: { min: number | null; max: number | null };
    minRating: number | null;
    minDiscount: number | null;
    sort: string;
    featured: boolean | null;
  };
}

interface PostRequestBody {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  sections?: string[];
  priceRange?: { min?: number | string; max?: number | string };
  minRating?: number;
  minDiscount?: number;
  sort?: SortOption;
  featured?: boolean;
  tags?: string[];
}

interface PostResponseBody {
  success: true;
  products: unknown[];
  pagination: Pick<PaginationInfo, "page" | "limit" | "total" | "totalPages">;
}

interface ErrorResponseBody {
  success: false;
  error: string;
  message?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSortOptions(sort: string): SortQuery {
  switch (sort as SortOption) {
    case "popular":
      return { numberSold: -1, "ratings.average": -1 };
    case "best-rated":
      return { "ratings.average": -1, "ratings.count": -1 };
    case "newest":
      return { createdAt: -1 };
    case "price-low-high":
      return { price: 1 };
    case "price-high-low":
      return { price: -1 };
    default:
      return { createdAt: -1 };
  }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest
): Promise<NextResponse<GetResponseBody | ErrorResponseBody>> {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const skip = (page - 1) * limit;

    const search = searchParams.get("search");
    const categorySlug = searchParams.get("category");
    const section = searchParams.get("sections");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const minDiscount = searchParams.get("minDiscount");
    const sort = searchParams.get("sort") ?? "popular";
    const featured = searchParams.get("featured");

    const filter: ProductFilter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
      ];
    }

    if (categorySlug) {
      const slugs = categorySlug.split(",");
      const categories = await Category.find({
        name: { $in: slugs.map((s) => new RegExp(`^${s}$`, "i")) },
      });
      if (categories.length > 0) {
        filter.category = { $in: categories.map((c) => c._id) };
      }
    }

    if (section) {
      const sectionArray = section.split(",");
      filter.section = { $in: sectionArray };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minRating) {
      filter["ratings.average"] = { $gte: parseFloat(minRating) };
    }

    if (minDiscount) {
      filter["flashSale.active"] = true;
      filter["flashSale.discountPercentage"] = { $gte: parseInt(minDiscount) };
    }

    if (featured) {
      filter.featured = featured === "true";
    }

    const sortOptions = buildSortOptions(sort);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name image")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<GetResponseBody>({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
      filters: {
        search,
        category: categorySlug,
        sections: section ? section.split(",") : [],
        priceRange: {
          min: minPrice ? parseFloat(minPrice) : null,
          max: maxPrice ? parseFloat(maxPrice) : null,
        },
        minRating: minRating ? parseFloat(minRating) : null,
        minDiscount: minDiscount ? parseInt(minDiscount) : null,
        sort,
        featured: featured ? featured === "true" : null,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error filtering products:", err);
    return NextResponse.json<ErrorResponseBody>(
      { success: false, error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest
): Promise<NextResponse<PostResponseBody | ErrorResponseBody>> {
  try {
    await connectToDatabase();

    const body = (await req.json()) as PostRequestBody;
    const {
      page = 1,
      limit = 12,
      search,
      category,
      sections = [],
      priceRange = {},
      minRating,
      minDiscount,
      sort = "popular",
      featured,
      tags = [],
    } = body;

    const skip = (page - 1) * limit;
    const filter: ProductFilter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
      ];
    }

    if (category) {
      const categoryInput = Array.isArray(category)
        ? category
        : category.split(",");

      const categoryIds: mongoose.Types.ObjectId[] = [];
      const categorySlugs: string[] = [];

      categoryInput.forEach((cat) => {
        if (mongoose.Types.ObjectId.isValid(cat)) {
          categoryIds.push(new mongoose.Types.ObjectId(cat));
        } else {
          categorySlugs.push(cat);
        }
      });

      if (categorySlugs.length > 0) {
        const found = await Category.find({
          name: { $in: categorySlugs.map((s) => new RegExp(`^${s}$`, "i")) },
        });
        found.forEach((c) => categoryIds.push(c._id));
      }

      if (categoryIds.length > 0) {
        filter.category = { $in: categoryIds };
      }
    }

    if (sections.length > 0) {
      filter.section = { $in: sections };
    }

    if (priceRange.min || priceRange.max) {
      filter.price = {};
      if (priceRange.min) filter.price.$gte = parseFloat(String(priceRange.min));
      if (priceRange.max) filter.price.$lte = parseFloat(String(priceRange.max));
    }

    if (minRating !== undefined) {
      filter["ratings.average"] = { $gte: minRating };
    }

    if (minDiscount !== undefined) {
      filter["flashSale.active"] = true;
      filter["flashSale.discountPercentage"] = { $gte: minDiscount };
    }

    if (featured !== undefined) {
      filter.featured = featured;
    }

    if (tags.length > 0) {
      filter.tags = { $in: tags.map((t) => new RegExp(t, "i")) };
    }

    const sortOptions = buildSortOptions(sort);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name image")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json<PostResponseBody>({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error in POST products filter:", err);
    return NextResponse.json<ErrorResponseBody>(
      { success: false, error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}