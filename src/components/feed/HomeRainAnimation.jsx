"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const ELEMENTS = [
  ["rain", 7, 2.4, 3.2, -0.8],
  ["rain", 18, 1.8, 2.8, -1.7],
  ["rain", 31, 2.2, 3.6, -2.5],
  ["rain", 44, 1.7, 2.9, -0.4],
  ["rain", 58, 2.5, 3.8, -2.0],
  ["rain", 72, 1.9, 3.1, -1.1],
  ["rain", 87, 2.3, 3.5, -2.9],
  ["leaf", 14, 7, 9, -4.5],
  ["leaf", 69, 6, 10, -7],
  ["snow", 27, 3, 8, -3],
  ["snow", 81, 2.5, 7, -6],
  ["wind", 8, 0, 8, -5],
  ["wind", 55, 0, 10, -2],
  ["lightning", 38, 0, 7, -5],
  ["fire", 91, 0, 9, -7],
  ["comet", 22, 0, 8, -6],
  ["comet", 76, 0, 11, -3],
];

const THEME_ELEMENTS = {
  light: new Set(["rain", "leaf", "wind"]),
  dark: new Set(["rain", "lightning", "wind", "fire"]),
  space: new Set(["comet", "rain", "wind"]),
  vintage: new Set(["rain", "leaf", "snow", "wind"]),
};

function RainDrop({ x, size, duration, delay, reducedMotion }) {
  const width = size * 0.42;
  const height = size * 1.35;

  return (
    <path
      d={`M ${x} 0 C ${x - width} ${height * 0.28}, ${x - width} ${height * 0.7}, ${x} ${height} C ${x + width} ${height * 0.7}, ${x + width} ${height * 0.28}, ${x} 0 Z`}
      fill="currentColor"
      className="text-primary/30"
      opacity={reducedMotion ? 0.12 : 0.24}
    >
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 -10"
          to="0 118"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </path>
  );
}

function Leaf({ x, duration, delay, reducedMotion }) {
  return (
    <path
      d={`M ${x} 0 C ${x - 3} 3, ${x - 2} 7, ${x + 1} 9 C ${x + 4} 6, ${x + 4} 2, ${x} 0 Z`}
      fill="currentColor"
      className="text-primary/20"
      opacity={reducedMotion ? 0.08 : 0.2}
    >
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-4 -10"
          to="12 118"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </path>
  );
}

function Snow({ x, size, duration, delay, reducedMotion }) {
  return (
    <g
      transform={`translate(${x} -8)`}
      className="text-primary/25"
      opacity={reducedMotion ? 0.1 : 0.24}
    >
      <circle cx="0" cy="0" r={size * 0.25} fill="currentColor" />
      <path d={`M ${-size} 0 H ${size} M 0 ${-size} V ${size}`} stroke="currentColor" strokeWidth="0.7" />
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          from={`${x} -8`}
          to={`${x + 5} 118`}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </g>
  );
}

function Wind({ x, duration, delay, reducedMotion }) {
  return (
    <path
      d={`M ${x} 18 C ${x + 5} 14, ${x + 10} 22, ${x + 15} 18 C ${x + 19} 15, ${x + 22} 17, ${x + 24} 20`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
      strokeLinecap="round"
      className="text-primary/15"
      opacity={reducedMotion ? 0.08 : 0.18}
    >
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-28 0"
          to="25 35"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </path>
  );
}

function Lightning({ reducedMotion }) {
  return (
    <path
      d="M 39 3 L 34 15 L 38 14 L 35 27 L 43 12 L 39 13 Z"
      fill="currentColor"
      className="text-primary/20"
      opacity={reducedMotion ? 0.05 : 0.18}
    >
      {!reducedMotion && (
        <animate
          attributeName="opacity"
          values="0;0;0.25;0.05;0.18;0"
          dur="7s"
          repeatCount="indefinite"
        />
      )}
    </path>
  );
}

function Fire({ reducedMotion }) {
  return (
    <g className="text-primary/15" opacity={reducedMotion ? 0.06 : 0.16}>
      <path d="M 88 100 C 87 91, 92 89, 90 82 C 96 88, 95 94, 93 100 Z" fill="currentColor" />
      <path d="M 94 100 C 93 95, 98 92, 96 87 C 101 93, 99 97, 98 100 Z" fill="currentColor" />
      <path d="M 90 100 C 90 96, 92 94, 92 90 C 96 96, 94 98, 94 100 Z" fill="currentColor" />
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; -1 -1; 1 0; 0 0"
          dur="1.8s"
          repeatCount="indefinite"
        />
      )}
    </g>
  );
}

function Comet({ x, duration, delay, reducedMotion }) {
  return (
    <g className="text-primary/20" opacity={reducedMotion ? 0.08 : 0.2}>
      <path d={`M ${x} 0 L ${x - 10} 7`} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx={x} cy="0" r="1.3" fill="currentColor" />
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-8 -8"
          to="35 120"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </g>
  );
}

export default function HomeRainAnimation({ containerRef }) {
  const { resolvedTheme } = useTheme();
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

  const active = THEME_ELEMENTS[resolvedTheme] || THEME_ELEMENTS.light;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 z-0 overflow-hidden"
      style={{ left: bounds.left, width: bounds.width }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        {ELEMENTS.map(([type, x, size, duration, delay], index) => {
          if (!active.has(type)) return null;

          if (type === "rain") {
            return <RainDrop key={index} x={x} size={size} duration={duration} delay={delay} reducedMotion={reducedMotion} />;
          }
          if (type === "leaf") {
            return <Leaf key={index} x={x} duration={duration} delay={delay} reducedMotion={reducedMotion} />;
          }
          if (type === "snow") {
            return <Snow key={index} x={x} size={size} duration={duration} delay={delay} reducedMotion={reducedMotion} />;
          }
          if (type === "wind") {
            return <Wind key={index} x={x} duration={duration} delay={delay} reducedMotion={reducedMotion} />;
          }
          if (type === "lightning") return <Lightning key={index} reducedMotion={reducedMotion} />;
          if (type === "fire") return <Fire key={index} reducedMotion={reducedMotion} />;
          if (type === "comet") {
            return <Comet key={index} x={x} duration={duration} delay={delay} reducedMotion={reducedMotion} />;
          }
          return null;
        })}
      </svg>
    </div>
  );
}
