import { motion, useScroll, useTransform } from "framer-motion";
import styles from "styles/layout/project.module.css";

export default function StepItem({ step, index }) {
  const id = `step-${index}`;

  const { scrollYProgress } = useScroll({
    target: `#${id}`,
    offset: ["start 0.9", "center 0.5"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["50px", "0px"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div id={id} className={styles.stepContainer} style={{ y, opacity }}>
      <div className={styles.stepHeader}>
        <span className={styles.stepNumber}>{index + 1}</span>
        <span className={styles.stepLabel}>{step.label}</span>
      </div>
      <div className={styles.stepContent}>{step.content}</div>
    </motion.div>
  );
}
