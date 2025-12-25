// pages/index.js
import { motion, useInView } from "framer-motion";
import { useRef } from "react"; 
import About from "components/home/About";
import Region from "components/home/Region";
import LatestMeetings from "components/home/LatestMeetings";
import LatestProjects from "components/home/LatestProjects";
import LatestUpdates from "components/home/LatestUpdates";
import styles from "styles/layout/landing.module.css";
import Sop from "components/home/Sop";
import RegionMeetingShortcut from "components/home/RegionMeetingShortcut";


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

const SectionWrapper = ({ children, id, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`${styles.section} ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default function Home() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  return (
    <div className={styles.landing}>  
      {/* Ongoing Improvement Banner */}
      <div className={styles.improvementBanner}>
        <div className={styles.bannerContent}>
          <span>This page is under ongoing improvement and limited to Mumbai Metropolitan Region</span>
        </div>
      </div>

            
        {/* Latest Projects Section */}
        <SectionWrapper id="latest-projects" className={styles.projectSection}>
          <LatestProjects limit={2} />
        </SectionWrapper>

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
              Ward <span className={styles.highlight}>Committees</span>
            </motion.h1>
            <motion.p 
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Local Unit for implementing <br />
              Community Driven Civic Collaboration.
            </motion.p>
            <motion.div 
              className={styles.heroCta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button 
                className={styles.ctaButton}
                onClick={() => document.getElementById('about-section').scrollIntoView({ behavior: 'smooth', block: 'center' })}
              >
                About Us
              </button>
              <button 
                className={styles.viewAllLink}
                onClick={() => document.getElementById('latest-updates').scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Monthly Updates
              </button>
            </motion.div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.floatingElement}></div>
            <div className={styles.floatingElement}></div>
            <div className={styles.floatingElement}></div>
          </div>
        </motion.section>

        <SectionWrapper id="meeting-shortcut" className={styles.latestSection}>
          <RegionMeetingShortcut regionCode="MH-MMR" limit={3} />
        </SectionWrapper>

        {/* Latest Meetings Section */}
        <SectionWrapper id="latest-meetings" className={styles.latestSection}>
          <div className={styles.sectionHeader}>
            <h2>Ward <span className={styles.highlight}>Meetings</span></h2>
            <p>Recent ward committee meetings and discussions</p>
          </div>
          <LatestMeetings limit={3} />
        </SectionWrapper>

        {/* About Section */}
        <SectionWrapper id="about-section">
          <About />
        </SectionWrapper>

        {/* Region Selection Section */}
        <SectionWrapper id="region-section">
          <Region />
        </SectionWrapper>

        {/* Latest Updates Section */}
        <SectionWrapper id="latest-updates" className={styles.latestSection}>
          <div className={styles.sectionHeader}>
            <h2>Monthly <span className={styles.highlight}>Updates</span></h2>
            <p>Monthly progress reports and community updates</p>
          </div>
          <LatestUpdates limit={3} />
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
                <h1>24</h1>
                <p>Active Ward Committees</p>
              </motion.div>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <h1>200+</h1>
                <p>Community Members</p>
              </motion.div>
              <motion.div 
                className={styles.statItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                <h1>35+</h1>
                <p>Community Walks</p>
              </motion.div>
            </div>
          </div>
        </SectionWrapper>
        {/* SOP & Handbook Section */}
        <SectionWrapper id="sop-section">
          <Sop 
            driveLink={driveLink}
            title="Walking Project SOP Handbook"
          />
        </SectionWrapper>
      </div>
  );
}