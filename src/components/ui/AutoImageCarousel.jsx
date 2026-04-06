"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AutoImageCarousel({ attachments = [] }) {
  const images = attachments
    .map((a) =>
      typeof a === "string" ? a : a?.url
    )
    .filter(Boolean);

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // ⏱️ Slower + controlled autoplay
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 🔥 slower (4 sec)

    return () => clearInterval(intervalRef.current);
  }, [images.length, isHovered]);

  if (images.length === 0) return null;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }} // smooth
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt="activity"
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === index
                  ? "bg-white scale-110"
                  : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}