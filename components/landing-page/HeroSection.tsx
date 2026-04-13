"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import heroBg from "@/public/assets/hero-bg.jpg";
import { useInView } from "framer-motion";
import { StarIcon, ArrowRight } from "lucide-react";
import Image from "next/image";
import { revealRight, revealUp, routes } from "@/lib/utils";

/* ─── Animated counter ─── */
const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="text-3xl font-bold text-accent">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/* Navbar is now the shared PublicNavbar component */
/* ─── Hero Section ─── */
const stats = [
  { value: 5000, suffix: "+", label: "Happy Customers" },
  { value: 200, suffix: "+", label: "Quality Products" },
  { value: 40, suffix: "%", label: "Average Savings" },
];

export const HeroSection = () => {
  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section id="home" className="relative overflow-hidden min-h-screen flex items-center" ref={parallaxRef}>
      {/* Parallax background */}
      <motion.div className="absolute inset-0 -top-20 -bottom-20" style={{ y: parallaxY }}>
        <Image src={heroBg} alt="Nigerian food products" className="w-full h-full object-cover scale-110" width={1920} height={1080} />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-br from-foreground/90 via-foreground/70 to-primary/20" />
      {/* Floating circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[8%] w-20 h-20 rounded-full bg-accent/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] right-[15%] w-14 h-14 rounded-full bg-primary/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] left-[5%] w-10 h-10 rounded-full bg-secondary/15 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[12%] w-16 h-16 rounded-full bg-accent/10 backdrop-blur-sm"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 py-20 sm:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left content */}
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            animate="visible"
            variants={revealUp}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-black text-xs font-bold mb-8 backdrop-blur-sm">
              <StarIcon size={12} className="fill-current" />
              Save up to 40% on everyday foodstuff
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
              <span className="text-secondary">
                Abundant Food,
                <br />
              </span>
              <span className="text-[#FFCC00]">Affordable </span>
              <span className="text-[#00D47E]">Prices.</span>
            </h1>

            <p className="text-primary-foreground/55 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
              Your one-stop marketplace for fresh groceries, gadgets, and business opportunities — delivered right to your doorstep.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={routes.shop.market}
                className="group inline-flex items-center gap-2 bg-accent text-black px-8 py-4 rounded-full text-sm font-bold hover:shadow-xl hover:shadow-accent/25 hover:-translate-y-1 transition-all duration-300"
              >
                Shop Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={routes.benefits}
                className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 px-8 py-4 rounded-full text-sm font-medium hover:bg-primary-foreground/20 transition-all duration-300 backdrop-blur-sm"
              >
                Join Pamarel
              </Link>
            </div>
          </motion.div>

          {/* Right stats column */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                animate="visible"
                variants={revealRight}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                className="bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 rounded-2xl p-6 hover:bg-primary-foreground/10 hover:border-accent/20 transition-all duration-500"
              >
                <div className="text-3xl font-bold text-accent mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-primary-foreground/50 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
