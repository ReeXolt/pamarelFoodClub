"use client";

import Link from "next/link";
import { Search, User, Menu, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  // { label: "About", href: "/#about" },
  { label: "Shop", href: "/market" },
  { label: "Benefits", href: "/join-member" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
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

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (link) => {
    if (link.href === "/") return location === "/";
    if (link.href) return location?.startsWith(link.href);
    return false;
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 h-16 border-b transition-all duration-300",
        scrolled
          ? "bg-card/20 backdrop-blur-xl border-border/40 shadow-md"
          : "bg-card border-border/60 shadow-sm"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-2xl font-black">
            <span className="text-primary">P</span>
            <span className="text-accent">a</span>
            <span className="text-foreground">marel</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Foods
          </span>
        </Link>

        {/* Desktop nav links + search */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const active = isActive(link);
            const commonClass = cn(
              "relative text-sm font-medium transition-colors py-1",
              active ? "text-primary" : "text-foreground hover:text-primary"
            );

            const underline = active && (
              <motion.span
                layoutId="nav-underline"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            );

            return (
              <a key={link.label} href={link.href} className={commonClass}>
                {link.label}
                {underline}
              </a>
            );
          })}

          {/* Collapsible search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    className="w-full rounded-full border border-border bg-muted/50 py-1.5 pl-3 pr-2 text-sm outline-none focus:border-primary/40 focus:bg-card"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => setSearchOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.1 }}
              type="submit"
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
            </motion.button>
          </form>
        </div>

        {/* Right: account, cart, mobile toggle */}
        <div className="flex items-center gap-4">
          <Link
            href={session?.user?.role === "admin" ? "/admin" : "/account"}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            title="Login"
          >
            <User className="h-4 w-4" />
          </Link>
          <button className="relative text-accent hover:text-accent/80 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border shadow-lg overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => {
                const active = isActive(link);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={cn(
                        "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

//   return (
//     <nav className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
//       <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
//         <div className="flex items-center gap-4">
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button variant="ghost" size="icon" className="md:hidden">
//                 <Menu />
//                 <span className="sr-only">Toggle menu</span>
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="left">
//                 <nav className="grid gap-6 text-lg font-medium mt-6 pl-5">
//                     <Link href="/" className="hover:text-primary">Home</Link>
//                     <Link href="/category" className="text-muted-foreground hover:text-primary">Shop</Link>
//                     {/* <Link href="/category" className="text-muted-foreground hover:text-primary">Deals</Link> */}
//                     <Link href="/contact" className="text-muted-foreground hover:text-primary">Support</Link>
//                     <Link href={session?.user?.role === "admin" ? "/admin" : "/account"} className="text-muted-foreground hover:text-primary">My Account</Link>
//                 </nav>
//             </SheetContent>
//           </Sheet>
//           <Link href="/" className="flex items-center gap-2">
//             <Image
//               src="/logo-55.png"
//               alt="logo"
//               width={100}
//               height={100}
//               className="object-contain"
//             />
//           </Link>
//         </div>
//         <div className="hidden flex-1 justify-center px-8 md:flex">
//           <form onSubmit={handleSearch} className="relative w-full max-w-lg">
//             <Input
//               type="search"
//               placeholder="Search products, brands and categories"
//               className="h-10 w-full rounded-full border-primary/50 pl-4 pr-12"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <Button
//               type="submit"
//               size="icon"
//               className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-accent hover:bg-accent/90"
//             >
//               <Search className="h-4 w-4 text-accent-foreground" />
//               <span className="sr-only">Search</span>
//             </Button>
//           </form>
//         </div>

//         <div className="flex items-center gap-2">
//             <Sheet open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="icon" className="md:hidden">
//                     <Search className="h-6 w-6" />
//                     <span className="sr-only">Search</span>
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="top" className="p-4 pt-8">
//                  <form onSubmit={handleSearch} className="relative w-full">
//                     <Input
//                       type="search"
//                       placeholder="Search products, brands and categories"
//                       className="h-10 w-full rounded-full border-primary/50 pl-4 pr-12"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                     <Button
//                       type="submit"
//                       size="icon"
//                       className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-accent hover:bg-accent/90"
//                     >
//                       <Search className="h-4 w-4 text-accent-foreground" />
//                       <span className="sr-only">Search</span>
//                     </Button>
//                   </form>
//               </SheetContent>
//             </Sheet>
            
//             <Button asChild variant="ghost" className="hidden md:flex">
//                 <Link href="/account">
//                     <User className="h-5 w-5" />
//                     <span>Account</span>
//                 </Link>
//             </Button>
//             <CartSheet />
//         </div>
//       </div>
//     </nav>
//   );
// }
