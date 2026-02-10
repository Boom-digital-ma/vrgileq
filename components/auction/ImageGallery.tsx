"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-black bg-gray-50">
        <Image
          src={images[selectedIndex]}
          alt="Auction Lot"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 right-4 bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          Image {selectedIndex + 1} of {images.length}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
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
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
