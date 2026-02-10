// components/home/Logo.js
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function Logo({ className = "", isCollapsed = false }) {
  const [isHovered, setIsHovered] = useState(false);

  // Size based on sidebar state
  const size = isCollapsed ? 40 : 32; // Slightly larger when collapsed to match other icons
  
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {!isHovered ? (
          // Normal icon state
          <motion.div
            key="normal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Citizen Action"
                fill
                className="object-contain p-1.5" // Add padding to prevent clipping
                sizes="(max-width: 768px) 40px, 40px"
              />
            </div>
          </motion.div>
        ) : (
          // Hover state – minimal glyph
          <motion.div
            key="hover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div 
              className="rounded-full bg-muted-foreground/25"
              style={{
                width: isCollapsed ? '24px' : '20px',
                height: isCollapsed ? '24px' : '20px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}