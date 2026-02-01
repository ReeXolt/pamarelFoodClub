
"use client";

import Link from "next/link";
import { Search, User, Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CartSheet } from "../account/cart-sheet";
import Image from "next/image";

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { data: session }  = useSession();
  const { cartCount } = useCart();



  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/category?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-6 pl-5">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <Link href="/category" className="text-muted-foreground hover:text-primary">Shop</Link>
                    {/* <Link href="/category" className="text-muted-foreground hover:text-primary">Deals</Link> */}
                    <Link href="/contact" className="text-muted-foreground hover:text-primary">Support</Link>
                    <Link href={session?.user?.role === "admin" ? "/admin" : "/account"} className="text-muted-foreground hover:text-primary">My Account</Link>
                </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-55.png"
              alt="logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </Link>
        </div>
        <div className="hidden flex-1 justify-center px-8 md:flex">
          <form onSubmit={handleSearch} className="relative w-full max-w-lg">
            <Input
              type="search"
              placeholder="Search products, brands and categories"
              className="h-10 w-full rounded-full border-primary/50 pl-4 pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-accent hover:bg-accent/90"
            >
              <Search className="h-4 w-4 text-accent-foreground" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>

        <div className="flex items-center gap-2">
            <Sheet open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Search className="h-6 w-6" />
                    <span className="sr-only">Search</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="p-4 pt-8">
                 <form onSubmit={handleSearch} className="relative w-full">
                    <Input
                      type="search"
                      placeholder="Search products, brands and categories"
                      className="h-10 w-full rounded-full border-primary/50 pl-4 pr-12"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-accent hover:bg-accent/90"
                    >
                      <Search className="h-4 w-4 text-accent-foreground" />
                      <span className="sr-only">Search</span>
                    </Button>
                  </form>
              </SheetContent>
            </Sheet>
            
            <Button asChild variant="ghost" className="hidden md:flex">
                <Link href="/account">
                    <User className="h-5 w-5" />
                    <span>Account</span>
                </Link>
            </Button>
            <CartSheet />
        </div>
      </div>
    </header>
  );
}
