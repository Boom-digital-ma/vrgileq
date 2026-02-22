"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1200";

export default function ImageGallery({ images, title = "Auction Lot" }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', transformOrigin: '0% 0%', transform: 'scale(1)' });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset loading state when changing images
  useState(() => {
    setImageLoading(true);
  });

  useEffect(() => {
    setImageLoading(true);
  }, [selectedIndex]);

  const validImages = images && images.length > 0 && images[0] !== "" 
    ? images 
    : [PLACEHOLDER_IMAGE];

  const currentImage = validImages[selectedIndex] || PLACEHOLDER_IMAGE;

  // Handle Swiping
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0) setSelectedIndex((prev) => (prev + 1) % validImages.length);
    else setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', transformOrigin: '0% 0%', transform: 'scale(1)' });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image with Zoom */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-zinc-50 border border-zinc-100 cursor-zoom-in group shadow-xl shadow-black/5"
      >
        <Image
          src={currentImage}
          alt={`${title} - Main Image - Virginia Liquidation`}
          fill
          className={cn(
            "object-cover transition-all duration-300 ease-out",
            imageLoading ? "blur-xl opacity-0 scale-105" : "blur-0 opacity-100 scale-100"
          )}
          onLoad={() => setImageLoading(false)}
          style={zoomStyle.display === 'block' ? { transform: zoomStyle.transform, transformOrigin: zoomStyle.transformOrigin } : {}}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
        />

        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/50 backdrop-blur-sm z-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        )}
        
        {/* Pagination Dots for Mobile Swiping */}
        {validImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none md:hidden">
                {validImages.map((_, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            i === selectedIndex ? "w-4 bg-primary" : "w-1 bg-white/60"
                        )} 
                    />
                ))}
            </div>
        )}

        {/* Counter Overlay */}
        {validImages.length > 1 && (
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold text-secondary shadow-sm transition-opacity group-hover:opacity-0">
                {selectedIndex + 1} / {validImages.length}
            </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-5 gap-4 px-2">
            {validImages.map((image, index) => (
            <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                    "relative aspect-square overflow-hidden rounded-2xl transition-all border-2",
                    selectedIndex === index
                        ? "border-primary shadow-lg shadow-primary/10 scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                )}
            >
                <Image
                    src={image || PLACEHOLDER_IMAGE}
                    alt={`${title} - Thumbnail ${index + 1} - Virginia Liquidation`}
                    fill
                    className="object-cover"
                    sizes="100px"
                />
            </button>
            ))}
        </div>
      )}
    </div>
  );
}
