// components/home/motion.js
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};
