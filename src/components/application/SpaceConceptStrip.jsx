"use client";

import { motion } from "framer-motion";
import DotLottieAnimation from "@/components/ui/DotLottieAnimation";

const concepts = [
  { title: "Space", animation: "/lottie/city.lottie" },
  { title: "People", animation: "/lottie/people.lottie" },
  { title: "Place", animation: "/lottie/location.lottie" },
  { title: "Governance", animation: "/lottie/politician.lottie" },
  { title: "Contributions", animation: "/lottie/report.lottie" },
  { title: "Timeline", animation: "/lottie/calendar.lottie" },
];

export default function SpaceConceptStrip() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border bg-muted/20 px-4 py-4 sm:px-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0 sm:max-w-xs">
          <p className="text-sm font-semibold">What is a Space?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            A shared place to bring people, places and civic work together.
          </p>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-6">
          {concepts.map((concept) => (
            <div
              key={concept.title}
              className="flex min-w-0 flex-col items-center gap-1.5 text-center"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-background/70">
                <DotLottieAnimation
                  src={concept.animation}
                  className="h-12 min-h-0 w-12"
                />
              </div>
              <span className="w-full truncate text-[11px] font-medium text-muted-foreground">
                {concept.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
