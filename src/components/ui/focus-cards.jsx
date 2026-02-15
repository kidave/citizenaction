"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function FocusCards({ cards = [], onCardClick }) {
  const [hovered, setHovered] = useState(null);

  if (!cards.length) return null;

  const visibleCards = cards.slice(0, 3);
  const remainingCount = cards.length - 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
      {visibleCards.map((card, index) => {
        const isLastVisible = index === 2 && remainingCount > 0;

        return (
          <div
            key={card.src || index}
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
            <img
              src={card.src}
              alt=""
              className="object-cover absolute inset-0 w-full h-full"
            />

            {/* +X Overlay */}
            {isLastVisible && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-semibold">
                +{remainingCount}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
