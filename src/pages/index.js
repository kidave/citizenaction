// pages/index.js
import { motion } from "framer-motion";
import Layout from "components/layout/Layout";
import About from "components/home/About";
import Region from "components/home/Region";
import styles from "styles/layout/landing.module.css";
import CommitteeButton from "components/shared/ui/CommitteeButton";

export default function Home() {
  return (
    <Layout>
      <div className={styles.landing}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <motion.h1 
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Making Cities <span className={styles.highlight}>Walkable</span>
            </motion.h1>
            <motion.p 
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              A citizen-driven initiative to create more walkable, inclusive, and vibrant neighborhoods
            </motion.p>
            <motion.div 
              className={styles.heroCta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button 
                className={styles.ctaButton}
                onClick={() => document.getElementById('region-section').scrollIntoView({ behavior: 'smooth' })}
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
        </section>

        {/* About Section */}
        <section className={styles.section}>
          <About />
        </section>

        {/* Region Selection Section */}
        <section id="region-section" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Explore Your Ward</h2>
            <p>Select your city and ward to see progress and get involved</p>
          </div>
          <Region />
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <h3>24</h3>
              <p>Active Wards</p>
            </div>
            <div className={styles.statItem}>
              <h3>200</h3>
              <p>Community Members</p>
            </div>
            <div className={styles.statItem}>
              <h3>35</h3>
              <p>Community Walks</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to make a difference?</h2>
            <p>Join your ward committee and help transform your neighborhood</p>
            <button className={styles.ctaButtonSecondary}>
              <a
                href="https://drive.google.com/file/d/1IXXgyc-Y2GNQvqsr5gwZQDx8PqTRP1y7/view"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn How to Participate
              </a>
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}