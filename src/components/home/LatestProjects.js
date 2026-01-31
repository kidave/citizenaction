"use client";

import { motion } from "framer-motion";
import { FiMapPin, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import useLatestItems from "hooks/useLatestItems";
import styles from "styles/components/home/latest-items.module.css";
import Spinner from "components/ui/Spinner";
import Link from "next/link";

export default function LatestProjects({ limit = 3 }) {
  const { data: projects, loading, error } = useLatestItems("project", limit);

  if (loading) return <Spinner mode="inline" size="small" />;
  if (error)
    return <div className={styles.noData}><p>Error: {error}</p></div>;
  if (!projects?.length)
    return (
      <div className={styles.noData}>
        <FiTrendingUp size={32} />
        <p>No active projects found</p>
      </div>
    );

  const statusConfig = {
    pending: { label: "Planning", class: "planned" },
    in_progress: { label: "In Progress", class: "inProgress" },
    completed: { label: "Completed", class: "completed" },
    on_hold: { label: "On Hold", class: "onHold" },
  };

  return (
    <div className={styles.container}>
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={styles.cardHeader}>
            <h5>{project.title}</h5>
            <span
              className={`${styles.status} ${styles[statusConfig[project.status]?.class]}`}
            >
              {statusConfig[project.status]?.label || project.status}
            </span>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.location}>
              <FiMapPin /> {project.ward?.name || "—"} Ward
            </span>

            <Link
              href={`/ward/${project.ward_code}/project`}
              className={styles.viewLink}
            >
              View Project <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
