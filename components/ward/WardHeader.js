// WardHeader.js
import styles from '../../styles/layout/header.module.css';
import { FaEnvelope } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

export default function WardHeader({ 
  wardName, 
  convenor, 
  convenorEmail, 
  coConvenor, 
  coConvenorEmail,
  showHeader = true 
}) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  if (!showHeader) return null;

  if (isMobile) {
    return (
      <div className={styles.wardHeaderMobile}>
        <h3 className={styles.wardNameMobile}>{wardName} Ward</h3>
      </div>
    );
  }

  // Original desktop version
  return (
    <div className={styles.wardHeader}>
      <div className={styles.wardInfo}>
        <h2>{wardName} Ward</h2>
        <div className={styles.leadership}>
          <div className={styles.leaderItem}>
            {convenor && (
              <>
                <p className={styles.leaderName}>
                  <strong>Convenor</strong> {convenor}
                </p>
                {convenorEmail && (
                  <div className={styles.emailContainer}>
                    <a href={`mailto:${convenorEmail}`} className={styles.emailLink}>
                      <FaEnvelope className={styles.emailIcon} />
                      <span className={styles.emailText}>{convenorEmail}</span>
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className={styles.leaderItem}>
            {coConvenor && (
              <>
                <p className={styles.leaderName}>
                  <strong>Co-Convenor</strong> {coConvenor}
                </p>
                {coConvenorEmail && (
                  <div className={styles.emailContainer}>
                    <a href={`mailto:${coConvenorEmail}`} className={styles.emailLink}>
                      <FaEnvelope className={styles.emailIcon} />
                      <span className={styles.emailText}>{coConvenorEmail}</span>
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
        <p>Community led improvements in {wardName} Ward</p>
      </div>
    </div>
  );
}