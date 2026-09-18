"use client";

import { motion } from "framer-motion";
import DotLottieAnimation from "@/components/ui/DotLottieAnimation";

const story = [
  {
    title: "Start with an idea",
    text: "Every Space begins with something worth organizing around.",
    animation: "/lottie/home.lottie",
  },
  {
    title: "Bring people together",
    text: "A Space gives people a shared place to contribute and collaborate.",
    animation: "/lottie/people.lottie",
  },
  {
    title: "Connect it to place",
    text: "Make the work local by connecting it to the places it affects.",
    animation: "/lottie/map.lottie",
  },
  {
    title: "Turn ideas into action",
    text: "Posts, documents and contributions become part of the work.",
    animation: "/lottie/workflow.lottie",
  },
  {
    title: "Build a record",
    text: "Keep the history visible so progress does not disappear.",
    animation: "/lottie/report.lottie",
  },
];

export default function SpaceConceptStrip() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border bg-muted/20 px-5 py-6 sm:px-7 sm:py-8"
    >
      <div className="relative">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            What happens inside a Space
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            From an idea to organized action.
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            You are not just creating a page. You are creating a place where civic work can grow over time.
          </p>
        </div>

        <div className="relative mt-7 space-y-1">
          {story.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: index % 2 ? 10 : -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="relative flex items-center gap-4 py-3 sm:gap-5"
            >
              {index < story.length - 1 ? (
                <span className="absolute left-7 top-[4.5rem] h-8 w-px bg-border sm:left-8" />
              ) : null}

              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-background ring-1 ring-border sm:h-16 sm:w-16">
                <DotLottieAnimation
                  src={item.animation}
                  className="h-16 min-h-0 w-16"
                />
              </div>

              <div className="min-w-0 pb-1">
                <p className="text-sm font-semibold sm:text-base">{item.title}</p>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
