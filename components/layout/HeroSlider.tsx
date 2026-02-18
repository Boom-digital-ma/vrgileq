"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Gavel, ArrowRight } from "lucide-react";
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
    <section className="relative h-[700px] md:h-[850px] w-full bg-secondary overflow-hidden">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-in-out",
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
            />
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/60 to-secondary" />
          </div>
          
          {/* Content */}
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 z-10">
            <div className={cn(
                "max-w-4xl transition-all duration-1000 delay-300",
                index === current ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-[1px] w-12 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                    {slide.welcome}
                </span>
              </div>
              
              <h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl leading-[0.9] text-white font-display italic uppercase">
                {slide.title.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "text-primary block" : "block"}>{word}</span>
                ))}
              </h1>
              
              <p className="mb-12 max-w-xl text-lg font-medium text-white/60 leading-relaxed italic">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link 
                  href={slide.link} 
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:bg-white hover:text-secondary shadow-2xl shadow-primary/20 flex items-center gap-3 group"
                >
                  {slide.cta} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:bg-white/10"
                >
                  View Corporate Family
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls - Minimalist SaaS */}
      <div className="absolute bottom-12 right-6 z-20 flex gap-2 md:right-12">
        <button 
          onClick={prevSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={nextSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Modern Progress Indicators */}
      <div className="absolute bottom-12 left-6 z-20 flex items-center gap-4 md:left-12">
        <div className="flex gap-2">
            {SLIDES.map((_, i) => (
            <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === current ? "w-12 bg-primary" : "w-4 bg-white/10 hover:bg-white/20"
                )}
            />
            ))}
        </div>
        <span className="text-[10px] font-bold text-white/20 tabular-nums">0{current + 1} / 0{SLIDES.length}</span>
      </div>
    </section>
  );
}
