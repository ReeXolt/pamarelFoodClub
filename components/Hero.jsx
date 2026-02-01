"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Hero() {
  const banners = [
    "/banner_up.jpeg",
    "/banner_4.jpeg",
    "/banner_2.jpeg",
    "/banner_3.jpeg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <header className="relative text-white overflow-hidden">
      <div className="relative">
        {banners.map((banner, index) => (
          <Image
            key={index}
            src={banner}
            alt={`hero banner ${index + 1}`}
            width={2000}
            height={300}
            className={`
              w-full
              ${index === currentIndex ? "block" : "hidden"}
            `}
          />
        ))}
        
        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all duration-200"
          aria-label="Previous banner"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all duration-200"
          aria-label="Next banner"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </header>
  );
}