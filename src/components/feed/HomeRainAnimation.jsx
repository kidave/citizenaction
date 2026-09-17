"use client";

import { useEffect, useState } from "react";

const DROPS = [
  [6, 11, 3.4, -1.8, 0.18],
  [12, 7, 2.8, -0.6, 0.13],
  [19, 13, 3.8, -2.4, 0.16],
  [27, 8, 3.1, -1.1, 0.12],
  [34, 15, 4.2, -3.2, 0.14],
  [42, 9, 3.0, -0.2, 0.17],
  [49, 12, 3.6, -2.0, 0.12],
  [57, 7, 2.7, -1.5, 0.15],
  [64, 14, 4.0, -3.8, 0.13],
  [71, 10, 3.2, -0.8, 0.16],
  [78, 15, 4.1, -2.7, 0.12],
  [85, 8, 2.8, -1.9, 0.14],
  [92, 12, 3.7, -3.0, 0.13],
  [97, 6, 2.5, -0.4, 0.11],
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
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {DROPS.map(([x, length, duration, delay, opacity], index) => (
          <g key={index}>
            <line
              x1={x}
              x2={x}
              y1={-length}
              y2={0}
              pathLength="1"
              stroke="currentColor"
              strokeWidth="0.22"
              strokeLinecap="round"
              className="text-primary"
              opacity={reducedMotion ? opacity * 0.35 : opacity}
            >
              {!reducedMotion && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 -12"
                  to="0 124"
                  dur={`${duration}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                />
              )}
            </line>
          </g>
        ))}
      </svg>
    </div>
  );
}
