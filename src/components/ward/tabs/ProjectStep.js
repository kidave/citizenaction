// components/shared/project/ProjectStep.js
import { motion } from "framer-motion";
import StepContent from "./StepContent";
import styles from "styles/tabs/project.module.css";

export default function ProjectStep({
  step,
  project,
  index,
  isCustom = false
}) {
  return (
    <motion.div
      key={step.key}
      className={styles.stepContainer}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className={styles.stepHeader}>
        <h4 className={styles.stepNumber}>{step.key}.</h4>
        <h4 className={styles.stepLabel}>{step.label}</h4>
      </div>
      <div className={styles.stepContent}>
        <StepContent
          stepKey={step.key}
          project={project}
          isCustom={isCustom}
        />
      </div>
    </motion.div>
  );
}