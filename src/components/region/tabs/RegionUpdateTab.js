// components/region/tabs/RegionUpdateTab.js
import useRegionUpdates from "hooks/useRegionUpdates";
import { useRegion } from "context/RegionContext";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/region.module.css";

export default function RegionUpdateTab() {
  const { regionCode } = useRegion();
  const { updates, loading, error } = useRegionUpdates(regionCode);

  if (loading) return <Spinner />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!updates.length) return <div className={styles.noData}>No updates found for this region.</div>;

  return (
    <div className={styles.tabContent}>
      <h2>Regional Updates</h2>
      <div className={styles.cardGrid}>
        {updates.map((update) => (
          <div key={update.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{update.title}</h3>
              <span className={styles.date}>
                {new Date(update.update_date).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.cardBody}>
              <p>{update.description}</p>
              {update.policy_implications && (
                <div className={styles.section}>
                  <h4>Policy Implications</h4>
                  <p>{update.policy_implications}</p>
                </div>
              )}
              {update.regional_impact && (
                <div className={styles.section}>
                  <h4>Regional Impact</h4>
                  <p>{update.regional_impact}</p>
                </div>
              )}
              {update.attachment_url && (
                <a href={update.attachment_url} target="_blank" rel="noreferrer" className={styles.link}>
                  View Attachment
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}