// components/home/LatestMeetings.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "utils/supabaseClient";
import styles from "styles/layout/latest-items.module.css";
import { FiMapPin, FiCalendar, FiArrowRight, FiUsers, FiImage } from "react-icons/fi";

export default function LatestMeetings({ limit = 3 }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [limit]);

  const fetchMeetings = async () => {
    try {
      const { data } = await supabase
        .from("meeting_with_images")
        .select(`
          *,
          ward:ward_code (name, division:division_code (city:city_code (code, name)))
        `)
        .order("date", { ascending: false })
        .limit(limit);

      setMeetings(data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const resolveUrl = (path) => {
    return supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;
  };

  const CardImage = ({ src, alt }) => {
    const [error, setError] = useState(false);

    if (error) {
      return (
        <div className={styles.imageError}>
          <FiImage />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={styles.cardImage}
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading meetings...</div>;
  }

  if (meetings.length === 0) {
    return (
      <div className={styles.noData}>
        <FiCalendar size={32} />
        <p>No recent meetings found</p>
      </div>
    );
  }

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
          {/* Image Gallery */}
          {meeting.images && meeting.images.length > 0 && (
            <div className={styles.cardImages}>
              <div className={styles.imageGrid}>
                {meeting.images.slice(0, 1).map((image) => (
                  <CardImage 
                    key={image.id} 
                    src={resolveUrl(image.path)} 
                    alt="Meeting photo" 
                  />
                ))}
              </div>
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
              <FiMapPin /> {meeting.ward.name} Ward
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