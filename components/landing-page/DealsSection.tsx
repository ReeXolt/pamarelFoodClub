'use client';
import { useInView, motion } from 'framer-motion';
import { useRef } from 'react';
import { revealUp, revealScale, routes } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';
import heroBg from '@/public/assets/hero-bg.jpg';
import foodMarket from '@/public/assets/food-market.jpg';
import gadgetHub from '@/public/assets/gadget-hub.jpg';
import Image from 'next/image';

export const DealsSection = () => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });
	const products = [
		{
			name: 'Premium Ofada Rice (50kg)',
			price: '₦12,500',
			oldPrice: '₦15,000',
			badge: '17% OFF',
			image: heroBg,
		},
		{
			name: 'Grocery Bundle Pack',
			price: '₦8,700',
			oldPrice: '₦12,000',
			badge: '28% OFF',
			image: foodMarket,
		},
		{
			name: 'Smart Home Bundle',
			price: '₦45,000',
			oldPrice: '₦65,000',
			badge: '31% OFF',
			image: gadgetHub,
		},
	];

	return (
		<section id="deals" className="py-24 bg-muted/30" ref={ref}>
			<div className="mx-auto max-w-7xl px-4 lg:px-8">
				<motion.div
					initial="hidden"
					animate={isInView ? 'visible' : 'hidden'}
					variants={revealUp}
					transition={{ duration: 0.5 }}
					className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
				>
					<div>
						<div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-[0.2em] mb-3">
							<Clock size={14} />
							Limited Time
						</div>
						<h2 className="font-display text-3xl font-bold text-foreground">
							Flash Sale Deals
						</h2>
					</div>
					<a
						href={routes.shop.market}
						className="text-primary text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
					>
						View All Deals <ArrowRight size={14} />
					</a>
				</motion.div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{products.map((p, i) => (
						<motion.div
							key={p.name}
							initial="hidden"
							animate={isInView ? 'visible' : 'hidden'}
							variants={revealScale}
							transition={{ duration: 0.4, delay: i * 0.12 + 0.2 }}
							className="group bg-background rounded-3xl overflow-hidden border border-border/50 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-500"
						>
							<div className="relative h-56 overflow-hidden">
								<Image
									src={p.image}
									alt={p.name}
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
									loading="lazy"
								/>
								<span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
									{p.badge}
								</span>
							</div>
							<div className="p-5">
								<h3 className="text-sm font-semibold text-foreground mb-3">
									{p.name}
								</h3>
								<div className="flex items-center gap-2 mb-4">
									<span className="text-primary font-bold text-lg">
										{p.price}
									</span>
									<span className="text-muted-foreground text-xs line-through">
										{p.oldPrice}
									</span>
								</div>
								{/* <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300">
									Add to Cart <ArrowRight size={14} />
								</button> */}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};
