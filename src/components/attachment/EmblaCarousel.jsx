"use client";

import useEmblaCarousel from "embla-carousel-react";

import Image from "next/image";

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
              key={image.url || index}
              className="relative h-[85vh] min-w-0 flex-[0_0_100%] select-none"
            >
              <Image
                src={image.url}
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

      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* ====================================
          NEXT
      ==================================== */}

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* ====================================
          MOBILE SWIPE HINT
      ==================================== */}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm md:hidden">
        Swipe to navigate
      </div>
    </div>
  );
}
