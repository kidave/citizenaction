// components/home/Sop.js
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Drive from "components/embed/Drive";
import styles from "styles/components/home/sop.module.css";
import { FiBook, FiTarget, FiUsers, FiTool, FiShield, FiArchive, FiRepeat } from "react-icons/fi";
import Image from "next/image";

const objectives = [
  {
    id: 1,
    icon: <FiBook />,
    title: "Provide a Clear Governance Framework",
    description: "Establish a standardized structure for how Ward Committees are formed, operated, and evaluated across all participating wards.",
    color: "#667eea",
    image: "/images/sop-objectives/objective-1.avif",
    alt: "Governance framework visualization showing hierarchical structure"
  },
  {
    id: 2,
    icon: <FiTarget />,
    title: "Guide Step-by-Step Implementation",
    description: "Lay out a practical, phase-wise roadmap from setup to execution that committees can follow to deliver tangible walkability improvements.",
    color: "#764ba2",
    image: "/images/sop-objectives/objective-2.avif",
    alt: "Step-by-step implementation roadmap with milestones"
  },
  {
    id: 3,
    icon: <FiUsers />,
    title: "Define Roles and Responsibilities",
    description: "Outline roles for each committee member and civic partner to ensure accountability and smooth coordination.",
    color: "#4facfe",
    image: "/images/sop-objectives/objective-3.avif",
    alt: "Team roles and responsibility matrix"
  },
  {
    id: 4,
    icon: <FiTool />,
    title: "Equip Committees with Tools and Templates",
    description: "Offer ready-to-use resources (forms, meeting formats, mapping tools, reporting templates) to streamline committee operations.",
    color: "#00f2fe",
    image: "/images/sop-objectives/objective-4.avif",
    alt: "Toolkit visualization with various templates and tools"
  },
  {
    id: 5,
    icon: <FiShield />,
    title: "Enable Civic-Government Collaboration",
    description: "Position Ward Committees as legitimate, recognized platforms that bridge the gap between citizens and municipal authorities.",
    color: "#42e695",
    image: "/images/sop-objectives/objective-5.avif",
    alt: "Collaboration bridge between citizens and government"
  },
  {
    id: 6,
    icon: <FiArchive />,
    title: "Promote Transparency and Record-Keeping",
    description: "Encourage the use of standardized documentation to ensure traceability and impact tracking.",
    color: "#3bb2b8",
    image: "/images/sop-objectives/objective-6.avif",
    alt: "Documentation and record-keeping visualization"
  },
  {
    id: 7,
    icon: <FiRepeat />,
    title: "Support Learning and Replication",
    description: "Capture learnings from each route and create a foundation for scaling successful interventions to other areas in a replicable manner.",
    color: "#f093fb",
    image: "/images/sop-objectives/objective-7.avif",
    alt: "Scaling and replication process flow"
  }
];

const purposeText = `This handbook is designed as a comprehensive Standard Operating Procedure (SOP) guide for the formation, operation, and functioning of Ward Committees under Walking Project's Initiative for improving the walkability on Mumbai's streets. It serves as both an orientation manual for new members and a working reference for ongoing activities. The primary aim is to enable ward-level citizen groups to collaborate effectively with the municipal system and other civic agencies to identify and resolve walkability challenges in a time-bound and structured manner.`;

export default function SopCta({ driveLink, title = "Walking Project Guide" }) {
  const [currentObjective, setCurrentObjective] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleNext = () => {
    setDirection(1);
    setCurrentObjective((prev) => 
      prev === objectives.length - 1 ? 0 : prev + 1
    );
    setIsLoading(true);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentObjective((prev) => 
      prev === 0 ? objectives.length - 1 : prev - 1
    );
    setIsLoading(true);
  };

  const goToObjective = (index) => {
    setDirection(index > currentObjective ? 1 : -1);
    setCurrentObjective(index);
    setIsLoading(true);
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

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      objectives.forEach((obj) => {
        const img = new window.Image();
        img.src = obj.image;
      });
    };
    
    if (typeof window !== 'undefined') {
      preloadImages();
    }
  }, []);

  return (
    <div className={styles.sopCta}>
      {/* Left Side: Drive Embed + Image */}
      <div className={styles.sopLeft}>
        <Drive 
          driveLink={driveLink}
          title={title}
        />

        {/* Image Navigation Dots */}
        <div className={styles.imageNavDots}>
          {objectives.map((_, index) => (
            <button
              key={index}
              className={`${styles.imageNavDot} ${
                index === currentObjective ? styles.active : ''
              }`}
              onClick={() => goToObjective(index)}
              aria-label={`Go to objective ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Image Animation Area */}
        <div className={styles.imageContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentObjective}
              className={styles.imageWrapper}
              initial={{ 
                opacity: 0,
                scale: 0.95
              }}
              animate={{ 
                opacity: 1,
                scale: 1
              }}
              exit={{ 
                opacity: 0,
                scale: 0.95
              }}
              transition={{ duration: 0.4 }}
            >
              {isLoading && (
                <div className={styles.imageSkeleton}></div>
              )}
              <Image
                src={objectives[currentObjective].image}
                alt={objectives[currentObjective].alt}
                width={600}
                height={400}
                className={styles.objectiveImage}
                onLoad={() => setIsLoading(false)}
                priority={currentObjective === 0}
                
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
            </motion.div>
          </AnimatePresence>
          
        </div>
      </div>

      {/* Right Side: Objectives Content */}
      <div className={styles.sopRight}>
        <h3 className={styles.sopTitle}>Standard Operating Procedure Handbook</h3>
        
        <div className={styles.sopPurpose}>
          {purposeText}
        </div>

        <h3 className={styles.sopSubtitle}>
          Objectives of the Handbook
        </h3>

        {/* Current Objective Card */}
        <div className={styles.objectiveCard}>
          <div className={styles.objectiveHeader}>
            <div 
              className={styles.objectiveIcon}
              style={{ 
                background: `linear-gradient(135deg, ${objectives[currentObjective].color} 0%, ${objectives[currentObjective].color}99 100%)` 
              }}
            >
              {objectives[currentObjective].icon}
            </div>
            <div>
              <h4 className={styles.objectiveNumber}>
                Objective {objectives[currentObjective].id}
              </h4>
              <h3 className={styles.objectiveTitle}>
                {objectives[currentObjective].title}
              </h3>
            </div>
          </div>
          <div className={styles.objectiveContent}>
            {objectives[currentObjective].description}
          </div>
        </div>
      </div>
    </div>
  );
}