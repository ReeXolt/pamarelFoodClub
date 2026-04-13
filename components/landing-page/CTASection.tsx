"use client"
import { useInView, motion } from "framer-motion";
import { useRef } from "react";
import { revealUp} from "@/lib/utils";
import { ArrowRight, Mail } from "lucide-react";

export const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-primary" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={revealUp}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-5">
            Join Pamarel Today
          </h2>
          <p className="text-primary-foreground/60 max-w-lg mx-auto mb-10 text-sm leading-relaxed">
            Start your journey and unlock a world of savings, quality products, and business opportunities.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <div className="relative flex-1 w-full">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3.5 rounded-full bg-primary-foreground text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3.5 rounded-full text-sm font-bold hover:shadow-xl hover:shadow-accent/20 transition-all">
              Sign Up <ArrowRight size={16} />
            </button>
          </div>
          <p className="text-primary-foreground/40 text-xs mt-4">
            Subscribe for exclusive offers, discounts, and updates.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
