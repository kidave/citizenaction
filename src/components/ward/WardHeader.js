// components/ward/WardHeader.js (optimized)
import styles from "styles/layout/wardheader.module.css";
import { FaEnvelope } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { useRegionData } from "hooks/useRegionData";
import { useRouter } from "next/router";
import { useWard } from "context/WardContext";

export default function WardHeader({ showHeader = true }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const router = useRouter();
  const { wardId } = router.query;
  const { wardInfo } = useWard();
  const {
    divisions,
    wards,
    currentDivision,
    handleDivisionChange,
    handleWardChange
  } = useRegionData();

  if (!showHeader) return null;

  if (isMobile) {
    return (
      <div className={styles.wardHeaderMobile}>
        <div className={styles.dropdownRow}>
          <div
            className={styles.logo}
            onClick={() => router.push("https://www.walkingproject.org")}
          >
            <img src="/wp_icon_sm.png" alt="Home" width={24} />
          </div>
          <div className={styles.dropdownWrapper}>
            <select
              value={currentDivision || ""}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Division</option>
              {divisions.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dropdownWrapper}>
            <select
              value={wardId || ""}
              onChange={(e) => handleWardChange(e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Ward</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
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