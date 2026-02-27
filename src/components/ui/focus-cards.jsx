"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function FocusCards({ images = [], onCardClick }) {
  const [hovered, setHovered] = useState(null);

  if (!images?.length) return null;

  const visibleImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  return (
    <>
      {/* ======================================================
          MOBILE LAYOUT
      ====================================================== */}
      <div className="md:hidden">
        <div
          className={cn(
            "grid gap-1 rounded-xl overflow-hidden",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {visibleImages.map((img, index) => {
            const isThreeLayout =
              images.length === 3 && index === 2;

            return (
              <div
                key={img.url || index}
                onClick={() => onCardClick?.(index)}
                className={cn(
                  "relative w-full cursor-pointer",
                  images.length === 1
                    ? "aspect-[3/2]"
                    : isThreeLayout
                    ? "col-span-2 aspect-[3/2]"
                    : "aspect-square"
                )}
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

      {/* ======================================================
          DESKTOP LAYOUT
      ====================================================== */}
      <div className="hidden md:grid grid-cols-3 gap-2 w-full">
        {images.slice(0, 3).map((img, index) => {
          const remainingDesktop = images.length - 3;
          const isLastVisible =
            index === 2 && remainingDesktop > 0;

          return (
            <div
              key={img.url || index}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onCardClick?.(index)}
              className={cn(
                "rounded-lg relative overflow-hidden h-60 w-full transition-all duration-300 ease-out cursor-pointer",
                hovered !== null &&
                  hovered !== index &&
                  "blur-sm scale-[0.98]"
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover"
              />

              {isLastVisible && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-semibold">
                  +{remainingDesktop}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}