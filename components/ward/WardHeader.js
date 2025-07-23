// WardHeader.js
import styles from '../../styles/layout/header.module.css';
import { FaEnvelope } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { useWardSelection } from '../../src/hooks/useWardSelection';
import { useRouter } from 'next/router';

export default function WardHeader({ 
  wardName, 
  convenor, 
  convenorEmail, 
  coConvenor, 
  coConvenorEmail,
  showHeader = true 
}) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const router = useRouter();
  const { wardId } = router.query;

  // Use ward selection hook
  const {
    divisions,
    wards,
    currentDivision,
    loadingDivisions,
    loadingWards,
    handleDivisionChange,
    handleWardChange,
  } = useWardSelection();
  
  if (!showHeader) return null;

  if (isMobile) {
    return (
      <div className={styles.wardHeaderMobile}>
        <div className={styles.dropdownRow}>
          <div 
            className={styles.logo} 
            onClick={() => router.push('https://www.walkingproject.org')}>
            <img src="/wp_icon_sm.png" alt="Home" width={24} />
          </div>
          <div className={styles.dropdownWrapper}>
            <select
              value={currentDivision || ''}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Division</option>
              {divisions.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.dropdownWrapper}>
            <select
              value={wardId || ''}
              onChange={(e) => handleWardChange(e.target.value)}
              className={styles.dropdown}
              disabled={!currentDivision || loadingWards}
            >
              <option value="">Ward</option>
              {wards.map(w => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
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