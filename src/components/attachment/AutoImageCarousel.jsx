"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AutoImageCarousel({ attachments = [] }) {
  const images = useMemo(
    () =>
      [...attachments]
        .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
        .map((attachment) => {
          // Actual image
          if (attachment?.mime_type?.startsWith("image/")) {
            return {
              id: attachment.id,
              url: attachment.public_url,
            };
          }

          // PDF thumbnail
          if (
            attachment?.mime_type === "application/pdf" &&
            attachment?.thumbnail_url
          ) {
            return {
              id: attachment.id,
              url: attachment.thumbnail_url,
            };
          }

          return null;
        })
        .filter(Boolean),
    [attachments],
  );

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [images.length, isHovered]);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (!images.length) return null;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={images[index].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={images[index].url}
            alt="activity"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            quality={75}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {images.map((image, i) => (
            <div
              key={image.id}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === index ? "scale-110 bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
