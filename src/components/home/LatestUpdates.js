// components/home/LatestUpdates.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "utils/supabaseClient";
import styles from "styles/layout/latest-items.module.css";
import { FiMapPin, FiArrowRight, FiFileText, FiImage } from "react-icons/fi";

export default function LatestUpdates({ limit = 3 }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, [limit]);

  const fetchUpdates = async () => {
    try {
      const { data } = await supabase
        .from("update_with_images")
        .select(`
          *,
          ward:ward_code (name, division:division_code (city:city_code (code, name)))
        `)
        .order("date", { ascending: false })
        .limit(limit);

      setUpdates(data || []);
    } catch (error) {
      console.error("Error fetching updates:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
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
    return <div className={styles.loading}>Loading updates...</div>;
  }

  if (updates.length === 0) {
    return (
      <div className={styles.noData}>
        <FiFileText size={32} />
        <p>No monthly updates found</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {updates.map((update, index) => (
        <motion.div
          key={update.id}
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Image Gallery */}
          {update.images && update.images.length > 0 && (
            <div className={styles.cardImages}>
              <div className={styles.imageGrid}>
                {update.images.slice(0, 1).map((image) => (
                  <CardImage 
                    key={image.id} 
                    src={resolveUrl(image.path)} 
                    alt="Update photo" 
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.cardHeader}>
            <h5>{formatDate(update.date)}</h5>
          </div>
          
          <div className={styles.cardBody}>
            <p className={styles.operation}>{update.operation?.substring(0, 120)}...</p>
          </div>
          
          <div className={styles.cardFooter}>
            <span className={styles.location}>
              <FiMapPin /> {update.ward.name} Ward
            </span>
            <a href={`/ward/${update.ward_code}/update`} className={styles.viewLink}>
              Read More <FiArrowRight />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}