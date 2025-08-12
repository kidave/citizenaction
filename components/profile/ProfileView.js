import styles from '../../styles/profile.module.css';

export default function ProfileView({ profile, onLogout }) {
  return (
    <>
      <div className={styles.detailsSection}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <h3>Personal Information</h3>
            <div className={styles.detailItem}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{profile.name || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{profile.email || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>
                {profile.country_code ? `${profile.country_code} ` : ''}
                {profile.phone || 'N/A'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Designation:</span>
              <span className={styles.value}>{profile.designation || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={onLogout} className={styles.logoutButton}>
          Sign Out
        </button>
      </div>
    </>
  );
}