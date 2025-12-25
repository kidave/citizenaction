// components/home/Sop.js
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DriveEmbed from "components/shared/ui/DriveEmbed";
import styles from "styles/layout/sop.module.css";
import { FiChevronLeft, FiChevronRight, FiBook, FiTarget, FiUsers, FiTool, FiShield, FiArchive, FiRepeat } from "react-icons/fi";

const objectives = [
  {
    id: 1,
    icon: <FiBook />,
    title: "Provide a Clear Governance Framework",
    description: "Establish a standardized structure for how Ward Committees are formed, operated, and evaluated across all participating wards.",
    color: "#667eea"
  },
  {
    id: 2,
    icon: <FiTarget />,
    title: "Guide Step-by-Step Implementation",
    description: "Lay out a practical, phase-wise roadmap from setup to execution that committees can follow to deliver tangible walkability improvements.",
    color: "#764ba2"
  },
  {
    id: 3,
    icon: <FiUsers />,
    title: "Define Roles and Responsibilities",
    description: "Outline roles for each committee member and civic partner to ensure accountability and smooth coordination.",
    color: "#4facfe"
  },
  {
    id: 4,
    icon: <FiTool />,
    title: "Equip Committees with Tools and Templates",
    description: "Offer ready-to-use resources (forms, meeting formats, mapping tools, reporting templates) to streamline committee operations.",
    color: "#00f2fe"
  },
  {
    id: 5,
    icon: <FiShield />,
    title: "Enable Civic-Government Collaboration",
    description: "Position Ward Committees as legitimate, recognized platforms that bridge the gap between citizens and municipal authorities.",
    color: "#42e695"
  },
  {
    id: 6,
    icon: <FiArchive />,
    title: "Promote Transparency and Record-Keeping",
    description: "Encourage the use of standardized documentation including meeting minutes, reports, photos, and videos to ensure traceability and impact tracking.",
    color: "#3bb2b8"
  },
  {
    id: 7,
    icon: <FiRepeat />,
    title: "Support Learning and Replication",
    description: "Capture learnings from each route and create a foundation for scaling successful interventions to other areas in a replicable manner.",
    color: "#f093fb"
  }
];

const purposeText = `This handbook is designed as a comprehensive Standard Operating Procedure (SOP) guide for the formation, operation, and functioning of Ward Committees under Walking Project's Initiative for improving the walkability on Mumbai's streets. It serves as both an orientation manual for new members and a working reference for ongoing activities. The primary aim is to enable ward-level citizen groups to collaborate effectively with the municipal system and other civic agencies to identify and resolve walkability challenges in a time-bound and structured manner.`;

export default function SopCta({ driveLink, title = "Walking Project Guide" }) {
  const [currentObjective, setCurrentObjective] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const handleNext = () => {
    setDirection(1);
    setCurrentObjective((prev) => 
      prev === objectives.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentObjective((prev) => 
      prev === 0 ? objectives.length - 1 : prev - 1
    );
  };

  const goToObjective = (index) => {
    setDirection(index > currentObjective ? 1 : -1);
    setCurrentObjective(index);
  };

  // Auto-advance every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key >= '1' && e.key <= '7') {
        goToObjective(parseInt(e.key) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.sopCta}>
      {/* Left Side: Drive Embed */}
      <div className={styles.sopLeft}>
        <DriveEmbed 
          driveLink={driveLink}
          title={title}
        />
      </div>

      {/* Right Side: Objectives */}
      <div className={styles.sopRight}>
        <h2 className={styles.sopTitle}>Standard Operating Procedure</h2>
        
        <div className={styles.sopPurpose}>
          {purposeText}
        </div>

        <h3 className={styles.sopTitle}>
          Objectives of the Handbook
        </h3>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ 
              width: `${((currentObjective + 1) / objectives.length) * 100}%` 
            }}
          />
        </div>

        {/* Animated Objectives Carousel */}
        <div className={styles.objectivesContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentObjective}
              className={styles.objectiveCard}
              initial={{ 
                opacity: 0,
                x: direction === 1 ? 100 : -100
              }}
              animate={{ 
                opacity: 1,
                x: 0
              }}
              exit={{ 
                opacity: 0,
                x: direction === 1 ? -100 : 100
              }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.objectiveHeader}>
                <div className={styles.objectiveNumber}>
                  {objectives[currentObjective].id}
                </div>
                <h3 className={styles.objectiveTitle}>
                  {objectives[currentObjective].title}
                </h3>
              </div>
              <div className={styles.objectiveContent}>
                {objectives[currentObjective].description}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className={styles.objectivesNavigation}>
          <button 
            className={styles.navButton}
            onClick={handlePrev}
            aria-label="Previous objective"
          >
            <FiChevronLeft />
          </button>

          <div className={styles.progressIndicator}>
            {objectives.map((_, index) => (
              <button
                key={index}
                className={`${styles.progressDot} ${
                  index === currentObjective ? styles.active : ''
                }`}
                onClick={() => goToObjective(index)}
                aria-label={`Go to objective ${index + 1}`}
              />
            ))}
          </div>

          <button 
            className={styles.navButton}
            onClick={handleNext}
            aria-label="Next objective"
          >
            <FiChevronRight />
          </button>
        </div>

        {/* Quick Objective List */}
        <div className={styles.objectivesList}>
          {objectives.map((obj, index) => (
            <div
              key={obj.id}
              className={`${styles.objectiveItem} ${
                index === currentObjective ? styles.active : ''
              }`}
              onClick={() => goToObjective(index)}
            >
              <span className={styles.objectiveItemNumber}>
                {obj.id}.
              </span>
              <span className={styles.objectiveItemTitle}>
                {obj.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}