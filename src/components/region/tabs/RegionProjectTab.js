// components/region/tabs/RegionProjectTab.js
import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";
import { useRegion } from "context/RegionContext";
import styles from "styles/layout/region.module.css";

export default function RegionProjectTab() {
  const { regionCode } = useRegion();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!regionCode) return;

    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("region_project")
        .select("*")
        .eq("region_code", regionCode)
        .order("start_date", { ascending: false });

      if (error) console.error(error);
      else setProjects(data || []);
      setLoading(false);
    };

    fetchProjects();
  }, [regionCode]);

  if (loading) return <div className={styles.loading}>Loading projects...</div>;
  if (!projects.length) return <div className={styles.noData}>No projects found for this region.</div>;

  const getStatusClass = (status) => {
    switch (status) {
      case "completed": return styles.statusCompleted;
      case "in_progress": return styles.statusInProgress;
      default: return styles.statusPending;
    }
  };

  return (
    <div className={styles.tabContent}>
      <h2>Regional Projects</h2>
      <div className={styles.cardGrid}>
        {projects.map((project) => (
          <div key={project.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{project.name}</h3>
              <span className={`${styles.status} ${getStatusClass(project.status)}`}>
                {project.status?.replace("_", " ") || "pending"}
              </span>
            </div>
            <div className={styles.cardBody}>
              <p>{project.description}</p>
              <div className={styles.projectDetails}>
                {project.start_date && (
                  <p><strong>Start:</strong> {new Date(project.start_date).toLocaleDateString()}</p>
                )}
                {project.end_date && (
                  <p><strong>End:</strong> {new Date(project.end_date).toLocaleDateString()}</p>
                )}
                {project.budget && (
                  <p><strong>Budget:</strong> ₹{project.budget.toLocaleString()}</p>
                )}
                {project.funding_source && (
                  <p><strong>Funding:</strong> {project.funding_source}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}