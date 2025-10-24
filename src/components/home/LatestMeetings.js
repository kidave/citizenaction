import { motion } from "framer-motion";
import { FiMapPin, FiCalendar, FiArrowRight, FiImage } from "react-icons/fi";
import useLatestItems from "hooks/useLatestItems";
import styles from "styles/layout/latest-items.module.css";

export default function LatestMeetings({ limit = 3 }) {
  const { data: meetings, loading, error } = useLatestItems("meeting", limit);

  if (loading) return <div className={styles.loading}>Loading meetings...</div>;
  if (error)
    return <div className={styles.noData}><p>Error: {error}</p></div>;
  if (!meetings?.length)
    return (
      <div className={styles.noData}>
        <FiCalendar size={32} />
        <p>No recent meetings found</p>
      </div>
    );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className={styles.container}>
      {meetings.map((meeting, index) => (
        <motion.div
          key={meeting.id}
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {meeting.images?.[0] ? (
            <img
              src={meeting.images[0].path}
              alt="Meeting photo"
              className={styles.cardImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.imageError}>
              <FiImage />
            </div>
          )}

          <div className={styles.cardHeader}>
            <h5>{meeting.title}</h5>
            <span className={styles.date}>
              <FiCalendar /> {formatDate(meeting.date)}
            </span>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.location}>
              <FiMapPin /> {meeting.ward?.name || "—"} Ward
            </span>
            <a href={`/ward/${meeting.ward_code}/meeting`} className={styles.viewLink}>
              View Details <FiArrowRight />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}