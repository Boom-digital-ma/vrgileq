"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1200";

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', transformOrigin: '0% 0%', transform: 'scale(1)' });
  const containerRef = useRef<HTMLDivElement>(null);

  const validImages = images && images.length > 0 && images[0] !== "" 
    ? images 
    : [PLACEHOLDER_IMAGE];

  const currentImage = validImages[selectedIndex] || PLACEHOLDER_IMAGE;

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
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-zinc-50 border border-zinc-100 cursor-zoom-in group shadow-xl shadow-black/5"
      >
        <Image
          src={currentImage}
          alt="Auction Lot"
          fill
          className="object-cover transition-transform duration-200 ease-out"
          style={zoomStyle.display === 'block' ? { transform: zoomStyle.transform, transformOrigin: zoomStyle.transformOrigin } : {}}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
        />
        
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
                    alt={`Thumbnail ${index + 1}`}
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
