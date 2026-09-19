"use client";

import { useRef } from "react";

import HomeRainAnimation from "@/components/feed/HomeRainAnimation";

export default function CenterColumn({ children }) {
  const containerRef = useRef(null);

  return (
    <main
      ref={containerRef}
      className="relative flex w-full min-w-0 flex-1 justify-center isolate"
    >
      <HomeRainAnimation containerRef={containerRef} />
      <div className="relative z-10 flex w-full min-w-0 justify-center">
        {children}
      </div>
    </main>
  );
}
