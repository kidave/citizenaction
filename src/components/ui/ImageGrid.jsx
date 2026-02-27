"use client";

import Image from "next/image";

export default function ImageGrid({
  images = [],
  onImageClick,
}) {
  if (!images.length) return null;

  return (
    <div className="md:hidden">
      <div
        className={`
          grid gap-1 rounded-xl overflow-hidden
          ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}
        `}
      >
        {images.slice(0, 4).map((img, index) => {
          const isThreeLayout =
            images.length === 3 && index === 2;

          return (
            <div
              key={img.url || index}
              onClick={() => onImageClick?.(index)}
              className={`
                relative w-full cursor-pointer
                ${images.length === 1 ? "aspect-[16/9]" : "aspect-square"}
                ${
                  isThreeLayout
                    ? "col-span-2 aspect-square"
                    : ""
                }
              `}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover hover:opacity-90 transition"
              />

              {images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                  +{images.length - 4}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}