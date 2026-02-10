"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SLIDES from "@/data/slides.json";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative h-[800px] w-full bg-primary overflow-hidden">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover opacity-40 scale-105"
            priority={index === 0}
          />
          
          {/* Content */}
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center items-center px-6 z-10 text-center">
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center">
              <div className="mb-6 inline-block bg-secondary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
                {slide.welcome}
              </div>
              <h1 className="mb-8 text-4xl font-black uppercase tracking-tighter sm:text-6xl lg:text-7xl leading-none text-white drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="mb-12 max-w-2xl text-lg font-bold text-white/90 leading-relaxed uppercase tracking-tight drop-shadow-lg">
                {slide.description}
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link 
                  href={slide.link} 
                  className="bg-primary text-white px-10 py-5 text-xs font-black uppercase tracking-widest transition-all hover:bg-secondary border-2 border-primary shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  {slide.cta}
                </Link>
                <Link 
                  href="/contact" 
                  className="bg-white/10 backdrop-blur-md text-white border-2 border-white px-10 py-5 text-xs font-black uppercase tracking-widest transition-all hover:bg-white hover:text-primary"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-6 z-20 flex gap-4 md:right-12">
        <button 
          onClick={prevSlide}
          className="group flex h-12 w-12 items-center justify-center border-2 border-white/30 text-white transition-all hover:border-secondary hover:bg-secondary"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="group flex h-12 w-12 items-center justify-center border-2 border-white/30 text-white transition-all hover:border-secondary hover:bg-secondary"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-12 left-6 z-20 flex gap-3 md:left-12">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-500 ${
              i === current ? "w-12 bg-secondary" : "w-6 bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
