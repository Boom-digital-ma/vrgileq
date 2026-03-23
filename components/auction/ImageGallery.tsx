"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Loader2, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
  images: string[];
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  hideMainGallery?: boolean;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1200";

export default function ImageGallery({ images, title = "Auction Lot", isOpen, onClose, hideMainGallery = false }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [internalShowLightbox, setInternalShowLightbox] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const showLightbox = isOpen !== undefined ? isOpen : internalShowLightbox;
  
  const closeLightbox = () => {
    if (onClose) onClose();
    else setInternalShowLightbox(false);
  };

  const [zoomStyle, setZoomStyle] = useState({ display: 'none', transformOrigin: '0% 0%', transform: 'scale(1)' });
  const [imageLoading, setImageLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setImageLoading(true);
  }, [selectedIndex]);

  // Prevent scroll when lightbox is open
  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showLightbox]);

  const validImages = images && images.length > 0 && images[0] !== "" 
    ? images 
    : [PLACEHOLDER_IMAGE];

  const currentImage = validImages[selectedIndex] || PLACEHOLDER_IMAGE;

  const nextImage = () => setSelectedIndex((prev) => (prev + 1) % validImages.length);
  const prevImage = () => setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || showLightbox) return;
    
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

  const galleryContent = !hideMainGallery ? (
    <div className="flex flex-col gap-6">
      {/* Main Image with Zoom Button */}
      <div 
        ref={containerRef}
        onClick={() => { if (isOpen === undefined) setInternalShowLightbox(true); else if (onClose) setInternalShowLightbox(true); }}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-zinc-50 border border-zinc-100 cursor-pointer group shadow-xl shadow-black/5"
      >
        <Image
          src={currentImage}
          alt={`${title} - Main Image`}
          fill
          className={cn(
            "object-cover transition-all duration-300 ease-out",
            imageLoading ? "blur-xl opacity-0 scale-105" : "blur-0 opacity-100 scale-100"
          )}
          onLoad={() => setImageLoading(false)}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
        />

        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/50 backdrop-blur-sm z-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        )}
        
        {validImages.length > 1 && (
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold text-secondary shadow-sm">
                {selectedIndex + 1} / {validImages.length}
            </div>
        )}
      </div>
      
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
                    alt={`${title} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                />
            </button>
            ))}
        </div>
      )}
    </div>
  ) : null;

  const lightboxContent = mounted ? createPortal(
    <AnimatePresence>
      {showLightbox && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-white/95 flex flex-col items-center justify-center p-4 md:p-12"
          onClick={closeLightbox}
        >
          {/* Header / Controls */}
          <div className="absolute top-8 left-8 right-8 flex items-center justify-between text-secondary z-[110]" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold tracking-tight uppercase opacity-60">Visual Inspection</h3>
              <p className="text-lg font-black italic uppercase tracking-tighter">{title}</p>
            </div>
            <button 
              onClick={closeLightbox}
              className="p-4 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-full transition-all group active:scale-90 text-secondary"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Main Lightbox Content */}
          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full h-[70vh] md:h-[80vh]"
              >
                <Image
                  src={validImages[selectedIndex]}
                  alt={title}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 md:left-10 p-4 text-zinc-400 hover:text-secondary hover:bg-zinc-100 rounded-full transition-all"
                >
                  <ChevronLeft size={48} strokeWidth={1} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 md:right-10 p-4 text-zinc-400 hover:text-secondary hover:bg-zinc-100 rounded-full transition-all"
                >
                  <ChevronRight size={48} strokeWidth={1} />
                </button>
              </>
            )}
          </div>

          {/* Pagination Counter */}
          <div className="absolute bottom-12 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Image {selectedIndex + 1} of {validImages.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      {galleryContent}
      {lightboxContent}
    </>
  );
}
