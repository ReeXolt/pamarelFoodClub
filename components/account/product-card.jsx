"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }) {
  // Safely calculate discount
  const discount = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Safe image handling
  const mainImage = product.images?.[0]?.url || '/images/placeholder.jpg';

  return (
    <Link href={`/product/${product._id}`} className="group relative block h-full">
        <Card className="flex h-full flex-col p-0 overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <CardContent className="flex flex-1 flex-col p-0">
            <div className="relative w-full aspect-square">
            <Image
                src={mainImage}
                alt={product.name || 'Product image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {discount > 0 && (
                <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                -{discount}%
                </div>
            )}
            </div>
            <div className="flex flex-1 flex-col justify-between p-3">
              <div>
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {product.name || 'Unnamed Product'}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating || 0}</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                    <p className="text-base font-bold text-primary">
                      ₦{formatPrice(product.price || 0)}
                    </p>
                </div>
              </div>
            </div>
        </CardContent>
        </Card>
    </Link>
  );
}