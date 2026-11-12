"use client";

import useEmblaCarousel from "embla-carousel-react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCallback, useEffect } from "react";

export default function EmblaCarousel({ images = [], startIndex = 0 }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex,
    dragFree: false,
  });

  /* ========================================
     NAVIGATION
  ======================================== */

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  /* ========================================
     RESET INDEX
  ======================================== */

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.scrollTo(startIndex, true);
  }, [emblaApi, startIndex]);

  /* ========================================
     KEYBOARD SUPPORT
  ======================================== */

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") {
        scrollPrev();
      }

      if (e.key === "ArrowRight") {
        scrollNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollPrev, scrollNext]);

  if (!images?.length) {
    return null;
  }

  return (
    <div className="relative touch-pan-y bg-black">
      {/* ====================================
          VIEWPORT
      ==================================== */}

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={image.public_url || index}
              className="relative h-[85vh] min-w-0 flex-[0_0_100%] select-none"
            >
              <Image
                src={image.public_url}
                alt=""
                fill
                draggable={false}
                sizes="100vw"
                className="pointer-events-none object-contain"
                priority={index === startIndex}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ====================================
          PREV
      ==================================== */}

      <Button
        onClick={scrollPrev}
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 rounded-full"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      {/* ====================================
          NEXT
      ==================================== */}

      <Button
        onClick={scrollNext}
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 rounded-full"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* ====================================
          MOBILE SWIPE HINT
      ==================================== */}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm md:hidden">
        Swipe to navigate
      </div>
    </div>
  );
}
