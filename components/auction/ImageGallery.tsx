"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1200";

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // S'assurer qu'on a au moins une image valide, sinon utiliser un placeholder
  const validImages = images && images.length > 0 && images[0] !== "" 
    ? images 
    : [PLACEHOLDER_IMAGE];

  const currentImage = validImages[selectedIndex] || PLACEHOLDER_IMAGE;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-black bg-gray-50">
        <Image
          src={currentImage}
          alt="Auction Lot"
          fill
          className="object-cover"
          priority
        />
        {validImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Image {selectedIndex + 1} of {validImages.length}
            </div>
        )}
      </div>
      
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
            {validImages.map((image, index) => (
            <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square overflow-hidden border-2 transition-all ${
                selectedIndex === index
                    ? "border-black scale-95 opacity-100"
                    : "border-gray-100 opacity-40 hover:opacity-100"
                }`}
            >
                <Image
                src={image || PLACEHOLDER_IMAGE}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                />
            </button>
            ))}
        </div>
      )}
    </div>
  );
}
