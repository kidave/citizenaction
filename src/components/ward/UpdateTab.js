// components/ward/tabs/UpdateTab.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWard } from "context/WardContext";
import useWardUpdates from "hooks/useWardUpdates";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/timeline.module.css";

export default function UpdateTab() {
  const { wardId } = useWard();
  const { updates, loading, error } = useWardUpdates(wardId);

  if (loading) return <Spinner />;
  if (error) return <div>Error loading updates: {error.message}</div>;

  // Helper function to format dates
  const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  };

  // Helper function to render discussion points
  const renderDiscussion = (label, content) => {
    if (!content) return null;

    const points = Array.isArray(content)
      ? content
      : content.split("\n").filter((s) => s.trim());

    return (
      <div className={styles.operationSection}>
        <h5 className={styles.sectionTitle}>{label}</h5>
        <ul className={styles.discussionList}>
          {points.map((pt, i) => (
            <li key={i} className={styles.discussionPoint}>
              <span className={styles.bullet}>•</span>
              {pt}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const DesktopUpdateCard = ({ update, index }) => {
    const [isActive, setIsActive] = useState(index === 0);

    return (
      <div className={styles.timelineItemUpdate}>
        <div
          className={styles.centeredDate}
          onClick={() => setIsActive(!isActive)}
          style={{ cursor: "pointer" }}
        >
          {formatDate(update.date)}
        </div>

        <div className={styles.fullWidthCard}>
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className={`${styles.timelineCard} ${styles.updateCard}`}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardTypeBadge}>Update</span>
                </div>
                <div className={styles.updateDetails}>
                  {renderDiscussion("Key Operations", update.operation)}
                  {renderDiscussion("Description", update.description)}
                  {renderDiscussion("Support Needed", update.support)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.timelineWrapper}>
      {updates.length === 0 ? (
        <p className={styles.emptyTimeline}>No updates yet.</p>
      ) : (
        <>
          {/* Desktop View */}
          <div className={styles.desktopView}>
            {updates.map((update, index) => (
              <DesktopUpdateCard 
                key={update.id} 
                update={update} 
                index={index} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}