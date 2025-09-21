// components/region/tabs/RegionPolicyTab.js
import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";
import { useRegion } from "context/RegionContext";
import styles from "styles/layout/region.module.css";

export default function RegionPolicyTab() {
  const { regionCode } = useRegion();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!regionCode) return;

    const fetchPolicies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("region_policy")
        .select("*")
        .eq("region_code", regionCode)
        .order("proposed_date", { ascending: false });

      if (error) console.error(error);
      else setPolicies(data || []);
      setLoading(false);
    };

    fetchPolicies();
  }, [regionCode]);

  if (loading) return <div className={styles.loading}>Loading policies...</div>;
  if (!policies.length) return <div className={styles.noData}>No policies found for this region.</div>;

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high": return styles.priorityHigh;
      case "medium": return styles.priorityMedium;
      default: return styles.priorityLow;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "implemented": return styles.statusImplemented;
      case "in_progress": return styles.statusInProgress;
      case "approved": return styles.statusApproved;
      default: return styles.statusProposed;
    }
  };

  return (
    <div className={styles.tabContent}>
      <h2>Regional Policy Suggestions</h2>
      <div className={styles.cardGrid}>
        {policies.map((policy) => (
          <div key={policy.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{policy.title}</h3>
              <div className={styles.meta}>
                <span className={`${styles.status} ${getStatusClass(policy.status)}`}>
                  {policy.status?.replace("_", " ") || "proposed"}
                </span>
                <span className={`${styles.priority} ${getPriorityClass(policy.priority)}`}>
                  {policy.priority} priority
                </span>
              </div>
            </div>
            <div className={styles.cardBody}>
              <p>{policy.description}</p>
              {policy.category && (
                <p><strong>Category:</strong> {policy.category}</p>
              )}
              {policy.estimated_impact && (
                <div className={styles.section}>
                  <h4>Estimated Impact</h4>
                  <p>{policy.estimated_impact}</p>
                </div>
              )}
              {policy.implementation_timeline && (
                <div className={styles.section}>
                  <h4>Implementation Timeline</h4>
                  <p>{policy.implementation_timeline}</p>
                </div>
              )}
              {policy.proposed_date && (
                <p className={styles.date}>
                  Proposed on: {new Date(policy.proposed_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}