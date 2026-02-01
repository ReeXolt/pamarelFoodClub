"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "../ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useCartStore, getCartCount, getCartTotal } from "@/stores/cart-store";
import { useRouter } from "next/navigation";

// Format price utility
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export function CartSheet() {
  const [open, setOpen] = useState(false);
  
  // Use cart store - get items directly
  const items = useCartStore((state) => state.items);
  const { incrementQuantity, decrementQuantity, removeItem, clearCart } = useCartStore();
  
  // Compute values from items
  const cartCount = getCartCount(items);
  const cartTotal = getCartTotal(items);
  const router = useRouter();

  // Function to render variant information
  const renderVariantInfo = (item) => {
    if (!item.selectedVariants || Object.keys(item.selectedVariants).length === 0) {
      return null;
    }

    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {Object.entries(item.selectedVariants).map(([key, value]) => (
          <Badge key={key} variant="outline" className="text-xs capitalize">
            {key}: {value}
          </Badge>
        ))}
      </div>
    );
  };

  const handleCheckout = () => {

    router.push("/checkout")
    
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-medium text-white">
              {cartCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({cartCount})</span>
            {cartCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <Separator />
        
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingCart className="h-20 w-20 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <SheetTrigger asChild>
              <Button variant="outline">Continue Shopping</Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 py-4">
                {items.map((item) => (
                  <div key={`${item.id}-${JSON.stringify(item.selectedVariants)}`} className="flex gap-4 py-4">
                    {/* Product Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                          {renderVariantInfo(item)}
                          
                          {/* Price */}
                          <div className="mt-1 flex items-center gap-2">
                            {item.discountedPrice ? (
                              <>
                                <span className="text-sm font-semibold text-red-600">
                                  {formatPrice(item.discountedPrice)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(item.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id, item.selectedVariants)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => decrementQuantity(item.id, item.selectedVariants)}
                            className="h-8 w-8"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => incrementQuantity(item.id, item.selectedVariants)}
                            className="h-8 w-8"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-sm font-semibold">
                          {formatPrice((item.discountedPrice || item.price) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Cart Footer */}
            <div className="border-t bg-gray-50 p-6">
              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                
                {/* Shipping Notice */}
                <p className="text-sm text-gray-600">
                  Shipping calculated at checkout.
                </p>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={handleCheckout}
                    size="lg"
                  >
                    Checkout Now
                  </Button>
                  
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full" size="lg">
                      Continue Shopping
                    </Button>
                  </SheetTrigger>
                </div>
                
                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-4 text-xs text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout · 100% guaranteed</span>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}