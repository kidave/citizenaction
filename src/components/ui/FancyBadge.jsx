"use client";

import { cn } from "@/lib/utils";

const variants = {
  yellow: "bg-yellow-300 text-black border-black",

  blue: "bg-blue-300 text-black border-black",

  green: "bg-green-300 text-black border-black",

  pink: "bg-pink-300 text-black border-black",

  purple: "bg-purple-300 text-black border-black",

  orange: "bg-orange-300 text-black border-black",

  dark: "bg-black text-white border-black",

  glass: `
    bg-white/10
    text-foreground
    border-white/20
    backdrop-blur-2xl
    backdrop-saturate-150
  `,
};

export default function FancyBadge({
  children,
  className,
  variant = "yellow",
}) {
  return (
    <div
      className={cn(
        `inline-flex select-none items-center justify-center rounded-full border-4 px-5 py-2 text-sm tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`,
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
