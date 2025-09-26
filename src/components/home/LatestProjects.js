// components/home/LatestProjects.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "utils/supabaseClient";
import styles from "styles/layout/latest-items.module.css";
import { FiMapPin, FiArrowRight, FiTrendingUp, FiImage } from "react-icons/fi";

export default function LatestProjects({ limit = 3 }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [limit]);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from("project_with_images")
        .select(`
          *,
          ward:ward_code (name, division:division_code (city:city_code (code, name)))
        `)
        .order("start_date", { ascending: false })
        .limit(limit);

      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: { label: 'Planning', class: 'planned' },
    in_progress: { label: 'In Progress', class: 'inProgress' },
    completed: { label: 'Completed', class: 'completed' },
    on_hold: { label: 'On Hold', class: 'onHold' }
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
    return <div className={styles.loading}>Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className={styles.noData}>
        <FiTrendingUp size={32} />
        <p>No active projects found</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >

          <div className={styles.cardHeader}>
            <h5>{project.title}</h5>
            <span className={`${styles.status} ${styles[statusConfig[project.status]?.class]}`}>
              {statusConfig[project.status]?.label || project.status}
            </span>
          </div>
          
          <div className={styles.cardFooter}>
            <span className={styles.location}>
              <FiMapPin /> {project.ward.name} Ward
            </span>
            <a href={`/ward/${project.ward_code}/project`} className={styles.viewLink}>
              View Project <FiArrowRight />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}