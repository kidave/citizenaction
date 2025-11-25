// components/ward/tabs/AnnouncementTab.js
import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useWardAnnouncements } from "hooks/useWardData";
import AnnouncementCard from "components/shared/card/AnnouncementCard";

import styles from "styles/tabs/announcement.module.css";

export default function AnnouncementTab() {
  const { wardCode } = useWard();
  const { data: announcements, loading, error } = useWardAnnouncements(wardCode);
  
  if (loading) return <p>Loading announcements...</p>;
  if (error) return <div>Error loading announcements: {error.message}</div>;

  return (
    <div className={styles.announcementContainer}>
      {!announcements || announcements.length === 0 ? (
        <div>
          <h3>No upcoming announcements</h3>
          <p>Check back later for community actions and events in your ward.</p>
        </div>
      ) : (
        <div className={styles.announcementList}>
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              className={styles.announcementCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AnnouncementCard
                announcement={announcement}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}