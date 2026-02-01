"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { heroSlides } from "@/lib/mock-data";
import Autoplay from "embla-carousel-autoplay"

export function HeroSection() {
  return (
    <section className="w-full">
      <Carousel 
        className="w-full"
        plugins={[
            Autoplay({
              delay: 5000,
            }),
        ]}
        opts={{
            loop: true,
        }}
        >
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[300px] w-full md:h-[400px]">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <h2 className="text-3xl font-bold md:text-5xl">{slide.title}</h2>
                  <p className="mt-2 text-lg md:text-xl">{slide.subtitle}</p>
                  <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
                    <Link href={slide.link}>Shop Now</Link>
                  </Button>
                </div>
              </div>

            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white" />
      </Carousel>
    </section>
  );
}
