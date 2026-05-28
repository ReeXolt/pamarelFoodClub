'use client';

import Link from 'next/link';
import { Search, User, Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { routes } from '@/utils/routes';
import { CartSheet } from './cart-sheet';
import { useCartStore, getCartCount } from '@/stores/cart-store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavLink {
	label: string;
	href: string;
}

interface SessionUser {
	email: string;
	id: string;
	name: string;
	role: string;
	username: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const navLinks: NavLink[] = [
	{ label: 'Home', href: '/' },
	{ label: 'Shop', href: routes.shop.index },
	{ label: 'Benefits', href: routes.benefits },
	{ label: 'Contact', href: routes.contact },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
	const { data: session } = useSession();
	const user = session?.user as SessionUser | undefined;
	const items = useCartStore((state) => state.items);
	const cartCount = getCartCount(items);

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		router.push(`/category?q=${encodeURIComponent(searchQuery.trim())}`);
		setSearchQuery('');
		setIsMobileSearchOpen(false);
	};

	const [scrolled, setScrolled] = useState<boolean>(false);
	const [mobileOpen, setMobileOpen] = useState<boolean>(false);
	const [searchOpen, setSearchOpen] = useState<boolean>(false);
	const location = usePathname();

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 8);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [scrolled]);

	useEffect(() => {
		setMobileOpen(false);
	}, [location]);

	const isActive = (link: NavLink): boolean => {
		if (link.href === '/') return location === '/';
		return location?.startsWith(link.href) ?? false;
	};

	return (
		<nav
			className={cn(
				'sticky top-0 z-50 h-16 border-b transition-all duration-300',
				scrolled
					? 'bg-card/20 backdrop-blur-xl border-border/40 shadow-md'
					: 'bg-card border-border/60 shadow-sm',
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
							'relative text-sm font-medium transition-colors py-1',
							active ? 'text-primary' : 'text-foreground hover:text-primary',
						);

						return (
							<a key={link.label} href={link.href} className={commonClass}>
								{link.label}
								{active && (
									<motion.span
										layoutId="nav-underline"
										className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
										transition={{ type: 'spring', stiffness: 300, damping: 30 }}
									/>
								)}
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
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setSearchQuery(e.target.value)
										}
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
						href={user?.role === 'admin' ? '/admin' : '/account'}
						className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
						title="Login"
					>
						<User className="h-4 w-4" />
					</Link>
					<CartSheet />
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
					>
						{mobileOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
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
											'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
											active
												? 'bg-primary/10 text-primary'
												: 'text-foreground hover:bg-muted',
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
}