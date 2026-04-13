'use client';
import { useInView, motion } from 'framer-motion';
import { useRef } from 'react';
import { revealUp } from '@/lib/utils';
import { Star } from 'lucide-react';

export const TestimonialSection = () => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });
	const testimonials = [
		{
			name: 'Adebayo Oladele',
			role: 'Lagos Customer',
			text: "I've saved over ₦50,000 in just 3 months. The food quality is outstanding and delivery is always on time!",
			rating: 5,
			avatar: 'AO',
		},
		{
			name: 'Chioma Eze',
			role: 'Stockist Partner',
			text: 'Becoming a Pamarel stockist has been a game-changer. The support and training are world-class.',
			rating: 5,
			avatar: 'CE',
		},
		{
			name: 'Ibrahim Musa',
			role: 'Abuja Customer',
			text: 'Best prices on rice and provisions in Abuja. My family loves the Premium Ofada Rice — unbeatable quality.',
			rating: 5,
			avatar: 'IM',
		},
		{
			name: 'Funke Adeyemi',
			role: 'Community Member',
			text: "The referral program is amazing. I've earned enough to cover my monthly groceries just by sharing!",
			rating: 4,
			avatar: 'FA',
		},
		{
			name: 'Emeka Nwosu',
			role: 'Port Harcourt Customer',
			text: 'Gadget Hub had the best deal on my new phone. Genuine products with warranty — highly recommend.',
			rating: 5,
			avatar: 'EN',
		},
		{
			name: 'Aisha Bello',
			role: 'Pickup Centre Owner',
			text: 'Running a pickup centre is profitable and fulfilling. Pamarel makes entrepreneurship accessible.',
			rating: 5,
			avatar: 'AB',
		},
	];
	const marqueeItems = [...testimonials, ...testimonials];
  
  return (
    <section className="py-24 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 mb-12">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={revealUp}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by <span className="text-primary">Thousands</span>
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Real stories from our growing community of happy customers and partners.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex animate-marquee gap-5 hover:paused">
          {marqueeItems.map((t, i) => (
            <div
              key={`r1-${i}`}
              className="shrink-0 w-85 bg-background border border-border/50 rounded-2xl p-6 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={13}
                    className={s < t.rating ? "text-accent fill-accent" : "text-border fill-border"}
                  />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-foreground text-sm font-semibold">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};