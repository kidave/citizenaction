import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "../../../styles/components/membercard.module.css";
import Image from "next/image";
import { MdVolunteerActivism } from "react-icons/md";
import CommitteeButton from "../../shared/ui/CommitteeButton";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaWhatsapp,
  FaUserAlt,
  FaUserTie,
  FaUserGraduate,
  FaWheelchair,
  FaStore,
  FaHome,
  FaChalkboardTeacher,
  FaUserSecret,
} from "react-icons/fa";
import { FaXTwitter, FaUserDoctor } from "react-icons/fa6";
import { useWard } from '../../../src/context/WardContext';

const SOCIAL_ICONS = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  github: FaGithub,
  xtwitter: FaXTwitter,
  whatsapp: FaWhatsapp,
};

const STAKEHOLDER_ICONS = {
  'Senior Citizen': FaUserAlt,
  'Business Owner': FaUserTie,
  'Civic Official': FaUserSecret,
  'Student': FaUserGraduate,
  'Person with Disability': FaWheelchair,
  'Resident': FaHome,
  'Street Vendor': FaStore,
  'Volunteer': MdVolunteerActivism,
  'Educator': FaChalkboardTeacher,
  'Healthcare Worker': FaUserDoctor
};

export default function CommitteeTab({ committees }) {
  const [showForm, setShowForm] = useState(false);
  const { wardId } = useWard();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [sortedCommittees, setSortedCommittees] = useState([]);

  // Sort members: Convenor → Co-convenor → Members
  useEffect(() => {
    const convenor = committees.find(c => c.is_convenor);
    const coConvenor = committees.find(c => c.is_co_convenor);
    const regularCommittees = committees.filter(c => !c.is_convenor && !c.is_co_convenor);
    setSortedCommittees([convenor, coConvenor, ...regularCommittees].filter(Boolean));
  }, [committees]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (sortedCommittees.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex(prev => (prev + 1) % sortedCommittees.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sortedCommittees.length]);

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return '/user.png';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `https://gostxgfnoilfmybaohhx.supabase.co/storage/v1/object/public/profile/avatar/${avatarUrl}`;
  };

  const getRoleDisplay = (committee) => {
    if (committee?.is_convenor) return 'Convenor';
    if (committee?.is_co_convenor) return 'Co-Convenor';
    return 'Member';
  };

  const getVisibleCommittees = () => {
    const count = sortedCommittees.length;
    if (count === 0) return [];
    
    return [
      sortedCommittees[(activeIndex - 2 + count) % count],
      sortedCommittees[(activeIndex - 1 + count) % count], // Left member
      sortedCommittees[activeIndex],                      // Center member (main card)
      sortedCommittees[(activeIndex + 1) % count],         // Right member
      sortedCommittees[(activeIndex + 2) % count]
    ];
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setActiveIndex(prev => (prev + newDirection + sortedCommittees.length) % sortedCommittees.length);
  };

  return (
    <div className={styles.cinematicContainer}>
      {sortedCommittees.length === 0 ? (
        <p className={styles.emptyMessage}>
          Want to join the committee? Tap the <strong>Apply</strong> button at the bottom right, or email us at{' '} 
          <a href="mailto:info@walkingproject.org">info@walkingproject.org</a>.
        </p>
      ) : (
        <>
          <div className={styles.backgroundRow}>
            {getVisibleCommittees().map((committee, i) => {
              if (i === 2 || !committee) return null;
              
              const isLeftSide = i < 2;
              const distanceFromCenter = isLeftSide ? 2 - i : i - 2;
              const position = isLeftSide 
                ? `${40 + (distanceFromCenter * 24)}%`  // Increased spacing for left side
                : `${40 + (distanceFromCenter * 24)}%`; // Increased spacing for right side
              
              return (
                <motion.div
                  key={`bg-${committee.user_id}-${i}`}
                  className={styles.backgroundMember}
                  style={{
                    position: 'absolute',
                    [isLeftSide ? 'left' : 'right']: position,
                    zIndex: 4 - distanceFromCenter
                  }}
                  initial={{ 
                    opacity: 0, 
                    x: isLeftSide ? -100 : 100,
                    scale: 0.9 - (distanceFromCenter * 0.1)
                  }}
                  animate={{ 
                    opacity: 0.8 - (distanceFromCenter * 0.3),
                    x: 0,
                    scale: 0.9 - (distanceFromCenter * 0.1),
                    filter: `blur(${distanceFromCenter}px)`
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={styles.backgroundImageContainer}>
                    <Image
                      src={getAvatarUrl(committee.avatar_url)}
                      width={120 - (distanceFromCenter * 50)}
                      height={120 - (distanceFromCenter * 50)}
                      alt=""
                      className={styles.backgroundImage}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Main Card */}
          <AnimatePresence mode="wait" custom={direction}>
            {sortedCommittees[activeIndex] && (
              <motion.div
                key={activeIndex}
                className={styles.cinematicCard}
                custom={direction}
                variants={{
                  enter: (direction) => ({
                    x: direction > 0 ? 300 : -300,
                    opacity: 0
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    transition: { duration: 0.5 }
                  },
                  exit: (direction) => ({
                    x: direction < 0 ? 300 : -300,
                    opacity: 0,
                    transition: { duration: 0.5 }
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    paginate(1);
                  } else if (swipe > 10000) {
                    paginate(-1);
                  }
                }}
              >
                <div className={styles.cinematicImageContainer}>
                  <Image
                    src={getAvatarUrl(sortedCommittees[activeIndex].avatar_url)}
                    alt={`${sortedCommittees[activeIndex].first_name} ${sortedCommittees[activeIndex].last_name || ''}`}
                    width={180}
                    height={180}
                    className={styles.cinematicImage}
                  />
                </div>
                <div className={styles.cinematicDetails}>
                  <h3>{sortedCommittees[activeIndex].first_name}{sortedCommittees[activeIndex].last_name ? ` ${sortedCommittees[activeIndex].last_name}` : ''}</h3>
                  <div className={styles.cinematicRole}>
                    <span>{getRoleDisplay(sortedCommittees[activeIndex])}</span>
                    {sortedCommittees[activeIndex].stakeholder_category && (
                      <div className={styles.cinematicCategory}>
                        {(() => {
                          const Icon = STAKEHOLDER_ICONS[sortedCommittees[activeIndex].stakeholder_category];
                          return Icon ? (
                            <Icon className={styles.categoryIcon} />
                          ) : (
                            <FaUserAlt className={styles.categoryIcon} />
                          );
                        })()}
                        <span>{sortedCommittees[activeIndex].stakeholder_category}</span>
                      </div>
                    )}
                  </div>
                  {sortedCommittees[activeIndex].designation && (
                    <p className={styles.cinematicDesignation}>{sortedCommittees[activeIndex].designation}</p>
                  )}
                  <div className={styles.cinematicSocial}>
                    {sortedCommittees[activeIndex].social && Object.entries(sortedCommittees[activeIndex].social).map(([platform, url]) => {
                      const Icon = SOCIAL_ICONS[platform];
                      return Icon && url ? (
                        <a 
                          key={platform} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          aria-label={platform}
                          className={styles.socialLink}
                        >
                          <Icon />
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className={styles.dotsContainer}>
            {sortedCommittees.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ''}`}
                onClick={() => {
                  setDirection(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                }}
                aria-label={`Go to member ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <CommitteeButton onClick={() => setShowForm(true)}/>
    </div>
  );
}