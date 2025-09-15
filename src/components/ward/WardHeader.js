// components/ward/WardHeader.js
import styles from "styles/layout/wardheader.module.css";
import { FaEnvelope } from "react-icons/fa";
import { useWard } from "context/WardContext";

export default function WardHeader({ showHeader = true }) {
  const { wardInfo } = useWard();

  if (!showHeader) return null;

  return (
    <div className={styles.wardHeader}>
      <div className={styles.wardInfo}>
        <h2>{wardInfo?.wardName} Ward</h2>
        <div className={styles.leadership}>
          <div className={styles.leaderItem}>
            {wardInfo?.convenor?.name && (
              <>
                <p className={styles.leaderName}>
                  <strong>Convenor</strong> {wardInfo.convenor.name}
                </p>
                {wardInfo.convenor.email && (
                  <div className={styles.emailContainer}>
                    <a
                      href={`mailto:${wardInfo.convenor.email}`}
                      className={styles.emailLink}
                    >
                      <FaEnvelope className={styles.emailIcon} />
                      <span className={styles.emailText}>{wardInfo.convenor.email}</span>
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.leaderItem}>
            {wardInfo?.coConvenor?.name && (
              <>
                <p className={styles.leaderName}>
                  <strong>Co-Convenor</strong> {wardInfo.coConvenor.name}
                </p>
                {wardInfo.coConvenor.email && (
                  <div className={styles.emailContainer}>
                    <a
                      href={`mailto:${wardInfo.coConvenor.email}`}
                      className={styles.emailLink}
                    >
                      <FaEnvelope className={styles.emailIcon} />
                      <span className={styles.emailText}>
                        {wardInfo.coConvenor.email}
                      </span>
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.wardTitle}>
        <h3>Walking Project</h3>
        <p>Community led improvements in {wardInfo?.wardName} Ward</p>
      </div>
    </div>
  );
}