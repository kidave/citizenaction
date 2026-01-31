import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  return (
    <div className="w-full">

      {/* Improvement Banner */}
      <div className="bg-yellow-100 text-yellow-800 text-center text-sm py-1 px-4 border-b border-yellow-300">
        This page is under ongoing improvement and limited to Mumbai Metropolitan Region
      </div>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={isHeroInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="
          min-h-[clamp(80vh,100vh,110vh)]
          flex items-center
          px-6 md:px-12 lg:px-24
          bg-gradient-to-br
          from-indigo-500/10
          to-purple-600/10
        "
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-7xl mx-auto">

          {/* Left: Content */}
          <div className="z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold"
            >
              Citizen{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Action
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-slate-700 max-w-xl leading-relaxed"
            >
              A civic documentation platform
              <br />
              designed to make citizen action visible.
            </motion.p>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:block">
            <FloatingBlob className="top-6 left-1/2 w-52 h-52" delay={0} />
            <FloatingBlob className="top-40 right-12 w-40 h-40" delay={2} />
            <FloatingBlob className="bottom-16 left-24 w-28 h-28" delay={4} />
          </div>
        </div>
      </motion.section>

    </div>
  );
}

function FloatingBlob({ className, delay }) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay }}
      className={`
        absolute rounded-full
        bg-gradient-to-br from-indigo-500/20 to-purple-600/20
        ${className}
      `}
    />
  );
}
