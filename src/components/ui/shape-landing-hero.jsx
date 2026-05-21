"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function HeroGeometric({
  badge = "Citizen Action",
  title1 = "Fix your",
  title2 = "neighborhood together",
  description = "Organize civic action with your community.",
  className,
}) {
  return (
    <section
      className={cn(
        `
          relative
          min-h-[90vh]

          overflow-hidden

          bg-background

          flex
          items-center
          justify-center
        `,
        className
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
          className="
            absolute

            top-20
            left-10

            w-72
            h-72

            rounded-full

            bg-pink-300/30
            blur-3xl
          "
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
          className="
            absolute

            bottom-10
            right-10

            w-80
            h-80

            rounded-[40%]

            bg-yellow-300/30
            blur-3xl
          "
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
          className="
            absolute

            top-1/2
            right-1/4

            w-60
            h-60

            rounded-[30%]

            bg-blue-300/30
            blur-3xl
          "
        />

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10

          max-w-6xl
          mx-auto

          px-6

          text-center
        "
      >

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

          <div
            className="
              inline-flex

              items-center

              rounded-full

              border-4
              border-black

              bg-yellow-300

              px-5
              py-2

              text-sm
              font-black

              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            "
          >

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
          className="
            mt-10

            text-5xl
            md:text-8xl

            font-black

            tracking-tight
            leading-[0.95]
          "
        >

          <span className="block">
            {title1}
          </span>

          <span
            className="
              block

              mt-3

              bg-gradient-to-r
              from-pink-500
              via-yellow-500
              to-blue-500

              bg-clip-text
              text-transparent
            "
          >

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
          className="
            mt-8

            max-w-2xl
            mx-auto

            text-lg
            md:text-xl

            text-muted-foreground
          "
        >

          {description}

        </motion.p>

      </div>

    </section>
  );
}