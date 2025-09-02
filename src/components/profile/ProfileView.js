import styles from "styles/profile.module.css";
import ReactCountryFlag from "react-country-flag";

export default function ProfileView({ profile }) {
  const hasPhone = !!profile.phone;
  const hasCountry = !!profile.country_code;

  const phone = hasPhone ? `+${profile.phone}` : "N/A";
  const countryCode = hasCountry ? profile.country_code.toUpperCase() : null;

  return (
    <div className={styles.detailsSection}>
      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <h3>Personal Information</h3>

          <div className={styles.detailItem}>
            <span className={styles.label}>Name:</span>
            <span className={styles.value}>{profile.name || "N/A"}</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{profile.email || "N/A"}</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.label}>Phone:</span>
            <span className={styles.value}>
              {countryCode ? (
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: "1.5em",
                    height: "1.5em",
                    marginRight: "0.5em",
                  }}
                />
              ) : (
                ""
              )}
              {phone}
            </span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.label}>Designation:</span>
            <span className={styles.value}>{profile.designation || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
