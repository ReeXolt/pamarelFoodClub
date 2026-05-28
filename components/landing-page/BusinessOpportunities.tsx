"use client"
import { useInView, motion } from "framer-motion";
import { useRef } from "react";
import stockistWoman from "@/public/assets/stockist-woman.jpg";
import { revealLeft, revealRight } from "@/lib/utils";
import { ArrowRight, Briefcase } from "lucide-react";
import Image from "next/image";
import { routes } from "@/utils/routes";

export const BusinessOpportunities = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
const benefits = [
  "Earn commission on every sale",
  "Access to wholesale pricing",
  "Marketing & logistics support",
  "Training and mentorship",
];

  return (
    <section id="about" className="py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={revealLeft}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden h-105"
          >
            <Image src={stockistWoman} alt="Paramel stockist partner" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute top-6 right-6 bg-accent text-accent-foreground px-4 py-2 rounded-2xl text-xs font-bold shadow-lg">
              Now Hiring ✨
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={revealRight}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/70 text-accent-foreground text-xs font-bold mb-6">
              <Briefcase size={14} />
              Business Opportunities
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-2">
              Become a Stockist or{" "}
              <span className="text-primary">Pickup Centre</span>
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8 mt-4">
              Partner with Pamarel to distribute products in your area and earn additional income. Join our growing network of entrepreneurs across Nigeria.
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <a href={routes.stockist} className="inline-flex items-center gap-2 text-sm px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-bold hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                <Briefcase size={16} />
                Apply Now
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
