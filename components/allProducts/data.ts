
export const DISCOUNT_PERCENTAGES = [50, 40, 30, 20, 10]
export const SECTIONS = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'gadget', label: 'Gadgets', icon: '📱' }
]

export const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price-low-high" },
  { label: "Price: High to Low", value: "price-high-low" },
  { label: "Highest Rated", value: "best-rated" },
  { label: "Newest First", value: "newest" },
];

export type categoryFilters = {
  createdAt: string;
  image: string;
  name: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

import { StaticImageData } from "next/image";

export type Product = {
  _id: string | number;
  name: string;
  description?: string;
  price: number;
  sellingPrice: number;
  section: string; // (keep as-is, even though schema restricts to enum)
  featured: boolean;
  images: (string | StaticImageData)[];
  category: {
    name: string;
    image: StaticImageData;
    slug?: string;
  };
  stock: number;
  numberSold: number;
  ratings: {
    average: number;
    count: number;
  };
  variants?: {
    name: string;
    options: string[];
  }[];
  flashSale?: {
    active: boolean;
    discountPercentage: number;
    startDate: string;
    endDate: string;
  };
  isFlashSaleActive?: boolean;
  discountedPrice?: number;
  tags: string[];
  reviews?: number;
  createdAt?: string;
  updatedAt?: string;
};