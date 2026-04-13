"use client"
import { useInView, motion } from "framer-motion";
import { useRef } from "react";
import foodMarket from "@/public/assets/food-market.jpg";
import gadgetHub from "@/public/assets/gadget-hub.jpg";
import { revealLeft, revealRight, revealUp, routes } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export const CategoriesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="categories" className="py-24 bg-background" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={revealUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Shop & Save in Our Marketplace
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Quality products, unbeatable prices, delivered to your doorstep.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Food – wider */}
          <motion.a
            href={`${routes.shop.market}#food`}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={revealLeft}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="group relative rounded-3xl overflow-hidden h-105 md:col-span-3 block"
          >
            <Image src={foodMarket} alt="Paramel Food Market" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-foreground/85 via-foreground/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold mb-3">
                FOOD MARKET
              </span>
              <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">Paramel Food Market</h3>
              <p className="text-primary-foreground/60 text-sm mb-4 max-w-xs">
                Fresh groceries, organic produce, and everyday essentials. Save up to 40%.
              </p>
              <span className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                Shop Groceries <ArrowRight size={14} />
              </span>
            </div>
          </motion.a>

          {/* Gadgets – narrower */}
          <motion.a
            href={`${routes.shop.market}#gadgets`}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={revealRight}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative rounded-3xl overflow-hidden h-105 md:col-span-2 block"
          >
            <Image src={gadgetHub} alt="Paramel Gadget Hub" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-foreground/85 via-foreground/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold mb-3">
                GADGET HUB
              </span>
              <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">Gadget Hub</h3>
              <p className="text-primary-foreground/60 text-sm mb-4 max-w-xs">
                Latest tech, electronics & accessories with member discounts.
              </p>
              <span className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                Explore Gadgets <ArrowRight size={14} />
              </span>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
};
