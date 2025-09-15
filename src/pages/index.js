// pages/index.js
import { motion, useInView } from "framer-motion";
import { useRef } from "react"; 
import Layout from "components/home/Layout";
import About from "components/home/About";
import Region from "components/home/Region";
import styles from "styles/layout/landing.module.css";
import CommitteeButton from "components/shared/ui/CommitteeButton";
import DriveEmbed from "components/shared/ui/DriveEmbed";

const driveLink = "https://drive.google.com/file/d/1IXXgyc-Y2GNQvqsr5gwZQDx8PqTRP1y7/preview";

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const SectionWrapper = ({ children, id }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={styles.section}
    >
      {children}
    </motion.section>
  );
};

export default function Home() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  return (
    <Layout>
      {/* Ongoing Improvement Banner */}
      <div className={styles.improvementBanner}>
        <div className={styles.bannerContent}>
          <span>This page is under ongoing improvement</span>
        </div>
      </div>

      <div className={styles.landing}>
        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          className={styles.hero}
          initial={{ opacity: 0 }}
          animate={isHeroInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.heroContent}>
            <motion.h1 
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Walking Project <span className={styles.highlight}>Ward Committees</span>
            </motion.h1>
            <motion.p 
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              The primary local unit for implementing the Walkability Improvement Initiative.
            </motion.p>
            <motion.div 
              className={styles.heroCta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button 
                className={styles.ctaButton}
                onClick={() => document.getElementById('about-section').scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Get Started
              </button>
              <CommitteeButton />
            </motion.div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.floatingElement}></div>
            <div className={styles.floatingElement}></div>
            <div className={styles.floatingElement}></div>
          </div>
        </motion.section>

        {/* About Section */}
        <SectionWrapper id="about-section">
          <About />
        </SectionWrapper>

        {/* Region Selection Section */}
        <SectionWrapper id="region-section">
          <Region />
        </SectionWrapper>

        {/* Stats Section */}
        <SectionWrapper id="stats-section">
          <div className={styles.ctaSection}>
            <div className={styles.statsContainer}>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>24</h3>
                <p>Active Ward Committees</p>
              </motion.div>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <h3>200+</h3>
                <p>Community Members</p>
              </motion.div>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                <h3>35+</h3>
                <p>Community Walks</p>
              </motion.div>
            </div>
            <div className={styles.ctaContent}>
              <DriveEmbed 
                driveLink={driveLink}
                title="Walking Project Guide"
              />
            </div>
          </div>
        </SectionWrapper>
      </div>
    </Layout>
  );
}