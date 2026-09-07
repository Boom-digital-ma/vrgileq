"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import SLIDES from "@/data/slides.json";
import { cn } from "@/lib/utils";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative h-[260px] w-full overflow-hidden bg-secondary md:h-[330px]">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-500 ease-in-out",
            index === current ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
          )}
        >
          {/* Background Image with sophisticated overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover opacity-50"
              priority={index === 0}
              suppressHydrationWarning
            />
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/60 to-secondary" />
          </div>
          
          {/* Content */}
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 z-10" suppressHydrationWarning>
            <div className={cn(
                "max-w-5xl transition-all duration-1000 delay-300",
                index === current ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}>
              <div className="mb-3 flex items-center gap-3 md:mb-4">
                <div className="h-[1px] w-12 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                    {slide.welcome}
                </span>
              </div>
              
              <h1 className="mb-3 text-2xl font-bold leading-[0.9] tracking-tight text-white font-display italic uppercase md:mb-4 md:text-4xl lg:text-5xl">
                {slide.title.split(' ').map((word, i, words) => (
                    <span key={i} className={i === 1 ? "text-primary" : ""}>
                      {word}{i < words.length - 1 && " "}
                    </span>
                ))}
              </h1>
              
              <p className="mb-4 max-w-xl text-sm font-medium leading-relaxed text-white/60 italic md:mb-6 md:text-base">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-4">
                {slide.showPrimaryCta && (
                  <Link
                    href={slide.link}
                    className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white shadow-2xl shadow-primary/20 transition-all hover:bg-white hover:text-secondary md:gap-3 md:rounded-2xl md:px-8 md:py-4 md:text-sm"
                    suppressHydrationWarning
                  >
                    {slide.cta} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" suppressHydrationWarning />
                  </Link>
                )}
                <Link
                  href="/auth/signup"
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/10 md:rounded-2xl md:px-8 md:py-4 md:text-sm"
                >
                  Register Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls - Minimalist SaaS */}
      <div className="absolute bottom-6 right-12 z-20 hidden gap-2 md:flex" suppressHydrationWarning>
        <button 
          onClick={prevSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
          suppressHydrationWarning
        >
          <ChevronLeft className="h-5 w-5" suppressHydrationWarning />
        </button>
        <button 
          onClick={nextSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
          suppressHydrationWarning
        >
          <ChevronRight className="h-5 w-5" suppressHydrationWarning />
        </button>
      </div>

      {/* Modern Progress Indicators */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-4 md:bottom-6 md:left-12">
        <div className="flex gap-2">
            {SLIDES.map((_, i) => (
            <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === current ? "w-8 bg-primary md:w-12" : "w-3 bg-white/10 hover:bg-white/20 md:w-4"
                )}
            />
            ))}
        </div>
        <span className="hidden text-[10px] font-bold text-white/20 tabular-nums md:block">0{current + 1} / 0{SLIDES.length}</span>
      </div>
    </section>
  );
}
