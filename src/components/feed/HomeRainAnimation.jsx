"use client";

import { useEffect, useState } from "react";

const DROPS = [
  [6, 2.2, 3.4, -1.8, 0.16],
  [12, 1.5, 2.8, -0.6, 0.12],
  [19, 2.6, 3.8, -2.4, 0.14],
  [27, 1.7, 3.1, -1.1, 0.11],
  [34, 2.9, 4.2, -3.2, 0.13],
  [42, 1.8, 3.0, -0.2, 0.15],
  [49, 2.3, 3.6, -2.0, 0.11],
  [57, 1.5, 2.7, -1.5, 0.13],
  [64, 2.7, 4.0, -3.8, 0.12],
  [71, 2.0, 3.2, -0.8, 0.14],
  [78, 2.8, 4.1, -2.7, 0.11],
  [85, 1.6, 2.8, -1.9, 0.12],
  [92, 2.4, 3.7, -3.0, 0.12],
  [97, 1.4, 2.5, -0.4, 0.10],
];

export default function HomeRainAnimation({ containerRef }) {
  const [bounds, setBounds] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(mediaQuery.matches);

    updateMotion();
    mediaQuery.addEventListener?.("change", updateMotion);
    return () => mediaQuery.removeEventListener?.("change", updateMotion);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    let frame;
    const updateBounds = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        setBounds({ left: rect.left, width: rect.width });
      });
    };

    updateBounds();
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateBounds, { passive: true });
    window.addEventListener("scroll", updateBounds, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
    };
  }, [containerRef]);

  if (!bounds) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 z-0 h-dvh overflow-hidden"
      style={{ left: bounds.left, width: bounds.width }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        {DROPS.map(([x, size, duration, delay, opacity], index) => {
          const half = size * 0.34;
          const tip = size * 0.82;

          return (
            <path
              key={index}
              d={`M ${x} 0 C ${x - half} ${size * 0.30}, ${x - half} ${size * 0.58}, ${x} ${tip} C ${x + half} ${size * 0.58}, ${x + half} ${size * 0.30}, ${x} 0 Z`}
              fill="currentColor"
              className="text-primary"
              opacity={reducedMotion ? opacity * 0.25 : opacity}
            >
              {!reducedMotion && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 -10"
                  to="0 120"
                  dur={`${duration}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              )}
            </path>
          );
        })}
      </svg>
    </div>
  );
}
