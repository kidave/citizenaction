"use client";

import { motion } from "framer-motion";
import { FiMapPin, FiArrowRight, FiFileText, FiImage } from "react-icons/fi";
import useLatestItems from "hooks/useLatestItems";
import styles from "styles/components/home/latest-items.module.css";
import Spinner from "components/ui/Spinner";
import Link from "next/link";

export default function LatestUpdates({ limit = 3 }) {
  const { data: updates, loading, error } = useLatestItems("update", limit);

  if (loading) return <Spinner mode="inline" size="small" />;
  if (error)
    return <div className={styles.noData}><p>Error: {error}</p></div>;
  if (!updates?.length)
    return (
      <div className={styles.noData}>
        <FiFileText size={32} />
        <p>No monthly updates found</p>
      </div>
    );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

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
          {update.images?.[0] ? (
            <img
              src={update.images[0].path}
              alt="Update"
              className={styles.cardImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.imageError}><FiImage /></div>
          )}

          <div className={styles.cardHeader}>
            <h5>{formatDate(update.date)}</h5>
          </div>

          <div className={styles.cardBody}>
            <p>{update.operation?.substring(0, 120)}…</p>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.location}>
              <FiMapPin /> {update.ward?.name || "—"} Ward
            </span>

            <Link
              href={`/ward/${update.ward_code}/update`}
              className={styles.viewLink}
            >
              Read More <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
