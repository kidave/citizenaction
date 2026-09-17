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
  ["leaf", 15, 1.0, 10, -3],
  ["leaf", 67, 0.75, 13, -8],
  ["snow", 27, 3, 8, -3],
  ["snow", 81, 2.5, 7, -6],
  ["lightning", 38, 0, 0, 0],
  ["fire", 91, 0, 0, 0],
  ["comet", 22, 0, 0.8, -12],
  ["comet", 76, 0, 0.7, -35],
];

const THEME_ELEMENTS = {
  light: new Set(["rain", "leaf"]),
  dark: new Set(["rain", "lightning", "fire"]),
  space: new Set(["comet", "rain"]),
  vintage: new Set(["rain", "leaf", "snow"]),
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
          from="0 -12"
          to="0 120"
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </path>
  );
}

function Leaf({ x, size, duration, delay, reducedMotion }) {
  const scale = size;
  const pathId = `leaf-path-${x}-${duration}`;

  return (
    <g className="text-primary/25" opacity={reducedMotion ? 0.1 : 0.3}>
      <defs>
        <path
          id={pathId}
          d={`M ${x - 5} -12 C ${x - 12} 20, ${x + 13} 40, ${x - 2} 64 C ${x - 16} 86, ${x + 16} 103, ${x + 7} 120`}
        />
      </defs>
      <g transform={`scale(${scale})`}>
        <g>
          <path
            d="M 0 0 C -5 1, -7 6, -4 10 C -1 14, 4 13, 7 8 C 9 4, 6 1, 0 0 Z"
            fill="currentColor"
          />
          <path
            d="M 0.5 1.5 C 1 5, 1 8, 3 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            strokeLinecap="round"
            opacity="0.65"
          />
          {!reducedMotion && (
            <animateMotion
              dur={`${duration}s`}
              begin={`${delay}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          )}
          {!reducedMotion && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-20 0 6; 35 0 6; 110 0 6; 55 0 6; -20 0 6"
              dur={`${duration * 0.82}s`}
              begin={`${delay}s`}
              repeatCount="indefinite"
              additive="sum"
            />
          )}
        </g>
      </g>
    </g>
  );
}

function Snow({ x, size, duration, delay, reducedMotion }) {
  return (
    <g
      className="text-primary/25"
      opacity={reducedMotion ? 0.1 : 0.24}
      transform={`translate(${x} -8)`}
    >
      <circle cx="0" cy="0" r={size * 0.2} fill="currentColor" />
      <path
        d={`M ${-size} 0 H ${size} M 0 ${-size} V ${size} M ${-size * 0.7} ${-size * 0.7} L ${size * 0.7} ${size * 0.7} M ${size * 0.7} ${-size * 0.7} L ${-size * 0.7} ${size * 0.7}`}
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinecap="round"
      />
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`${x} -8; ${x - 2} 32; ${x + 4} 68; ${x - 1} 118`}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          additive="sum"
          type="rotate"
          from="0"
          to="360"
          dur={`${duration * 0.9}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
    </g>
  );
}

function Lightning({ reducedMotion }) {
  return (
    <g>
      <rect width="100" height="100" fill="currentColor" className="text-primary" opacity="0">
        {!reducedMotion && (
          <animate
            attributeName="opacity"
            values="0;0;0.025;0;0;0.018;0"
            keyTimes="0;0.58;0.60;0.62;0.70;0.705;0.72"
            dur="9s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      <path
        d="M 38 2 L 34 13 L 38 12 L 35 25 L 43 10 L 39 11 Z"
        fill="currentColor"
        className="text-primary"
        opacity="0"
      >
        {!reducedMotion && (
          <animate
            attributeName="opacity"
            values="0;0;0.08;0.78;0.1;0;0;0.4;0"
            keyTimes="0;0.58;0.60;0.605;0.615;0.625;0.70;0.705;0.72"
            dur="9s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </g>
  );
}

function Fire({ reducedMotion }) {
  return (
    <g className="text-primary/15" opacity={reducedMotion ? 0.05 : 0.18}>
      <path d="M 86 100 C 87 94, 89 91, 88 85 C 93 89, 94 94, 92 100 Z" fill="currentColor" />
      <path d="M 91 100 C 91 95, 94 92, 94 87 C 99 92, 98 97, 97 100 Z" fill="currentColor" />
      <path d="M 94 100 C 94 96, 97 94, 97 90 C 100 94, 100 98, 99 100 Z" fill="currentColor" />
      {!reducedMotion && (
        <animate
          attributeName="opacity"
          values="0.12;0.2;0.14;0.22;0.12"
          dur="2.4s"
          repeatCount="indefinite"
        />
      )}
    </g>
  );
}

function Comet({ x, duration, delay, reducedMotion }) {
  return (
    <g className="text-primary/25" opacity={reducedMotion ? 0.05 : 0.28}>
      <path d="M 0 0 L -7 3.5 L -13 4" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
      <circle cx="0" cy="0" r="1.1" fill="currentColor" />
      {!reducedMotion && (
        <animateTransform
          attributeName="transform"
          type="translate"
          from={`${x - 14} -10`}
          to={`${x + 38} 55`}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      )}
      {!reducedMotion && (
        <animate
          attributeName="opacity"
          values="0;0.28;0.3;0"
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
            return <Leaf key={index} x={x} size={size} duration={duration} delay={delay} reducedMotion={reducedMotion} />;
          }
          if (type === "snow") {
            return <Snow key={index} x={x} size={size} duration={duration} delay={delay} reducedMotion={reducedMotion} />;
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
