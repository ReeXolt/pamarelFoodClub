"use client"
import { useInView, motion } from "framer-motion";
import { useRef } from "react";
import { revealUp } from "@/lib/utils";
import { BadgePercent, ShieldCheck, Truck, Users } from "lucide-react";

export const FeatureSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const features = [
  { icon: BadgePercent, title: "Up to 40% Savings", description: "Save big on everyday foodstuff and essentials with wholesale pricing." },
  { icon: Truck, title: "Doorstep Delivery", description: "Convenient delivery to your home or pickup from partner centres." },
  { icon: ShieldCheck, title: "Quality Guaranteed", description: "Every product is vetted for quality and freshness before reaching you." },
  { icon: Users, title: "Community Network", description: "Join thousands saving together and earning through referrals." },
];

  return (
    <section className="py-24 bg-muted/40" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={revealUp}
              transition={{ duration: 0.4, delay: i * 0.1 + 0.1 }}
              className="group text-center p-8 rounded-3xl bg-background border border-border/50 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                <f.icon size={24} className="text-accent group-hover:text-accent-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
