'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { heroSlides } from '@/lib/mock-data';
import Image from 'next/image';

export const HeroSection = () => {
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		const timer = setInterval(
			() => setCurrent((p) => (p + 1) % heroSlides.length),
			5000,
		);
		return () => clearInterval(timer);
	}, []);

	const prev = () =>
		setCurrent((p) => (p - 1 + heroSlides.length) % heroSlides.length);
	const next = () => setCurrent((p) => (p + 1) % heroSlides.length);

	return (
		<section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					key={current}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					className="absolute inset-0"
				>
					<Image
						src={heroSlides[current].imageUrl}
						alt={heroSlides[current].title}
						className="w-full h-full object-cover"
						width={1920}
						height={800}
					/>
					<div className="absolute inset-0 bg-foreground/50" />
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="text-4xl md:text-6xl font-bold text-card mb-4"
						>
							{heroSlides[current].title}
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.35 }}
							className="text-card/80 text-base md:text-lg mb-6 max-w-lg"
						>
							{heroSlides[current].subtitle}
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
						>
							<Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-8 py-2.5 font-semibold">
								<Link href={heroSlides[current].link}>Shop Now</Link>
							</Button>
						</motion.div>
					</div>
				</motion.div>
			</AnimatePresence>

			<button
				onClick={prev}
				className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-foreground shadow-lg hover:bg-card transition-colors"
			>
				<ChevronLeft className="h-5 w-5" />
			</button>
			<button
				onClick={next}
				className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-foreground shadow-lg hover:bg-card transition-colors"
			>
				<ChevronRight className="h-5 w-5" />
			</button>

			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
				{heroSlides.map((_, i) => (
					<button
						key={i}
						onClick={() => setCurrent(i)}
						className={`h-2.5 rounded-full transition-all ${
							i === current ? 'w-8 bg-accent' : 'w-2.5 bg-card/50'
						}`}
					/>
				))}
			</div>
		</section>
	);
};
