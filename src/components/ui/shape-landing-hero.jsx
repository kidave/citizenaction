"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function HeroGeometric({
  badge = "Citizen Action",
  title1 = "Support",
  title2 = "your cause.",
  description = "Organize civic action with your community.",
  className,
}) {
  return (
    <section
      className={cn(
        `relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background`,
        className,
      )}
    >
      {/* =====================================================
          BACKGROUND SHAPES
      ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">
        {/* BIG CIRCLE */}

        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
          }}
          className="absolute left-10 top-20 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl"
        />

        {/* YELLOW */}

        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
          }}
          className="absolute bottom-10 right-10 h-80 w-80 rounded-[40%] bg-yellow-300/30 blur-3xl"
        />

        {/* BLUE */}

        <motion.div
          animate={{
            x: [0, 30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 14,
          }}
          className="absolute right-1/4 top-1/2 h-60 w-60 rounded-[30%] bg-blue-300/30 blur-3xl"
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        {/* BADGE */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <div className="inline-flex items-center rounded-full border-4 border-black bg-yellow-300 px-5 py-2 text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {badge}
          </div>
        </motion.div>

        {/* TITLE */}

        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="mt-10 text-5xl font-black leading-[0.95] tracking-tight md:text-8xl"
        >
          <span className="block">{title1}</span>

          <span className="mt-3 block bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
            {title2}
          </span>
        </motion.h1>

        {/* DESCRIPTION */}

        <motion.p
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
