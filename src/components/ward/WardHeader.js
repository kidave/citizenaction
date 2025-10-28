// components/ward/WardHeader.js
import styles from "styles/layout/wardheader.module.css";
import { useWard } from "context/WardContext";
import { PiMapPinAreaFill } from "react-icons/pi";
import { FaMap } from "react-icons/fa";
import { useRouter } from "next/router";

export default function WardHeader({ showHeader = true }) {
  const { wardInfo, wardCode: contextWardCode, locationData } = useWard();
  const router = useRouter();
  const { wardCode: routerWardCode } = router.query;
  
  // Use router wardCode first, fall back to context wardCode
  const currentWardCode = routerWardCode || contextWardCode;

  const {
    divisions,
    wards,
    selectedDivision,
    handleDivisionChange,
    handleWardChange
  } = locationData || {};

  if (!showHeader) return null;

  return (
    <div className={styles.wardHeader}>
      {/* Dropdowns */}
      <div className={styles.selector}>
        <div className={styles.dropdownWrapper}>
          <FaMap className={styles.dropdownIcon} title="Division" />
          <select
            id="division-select"
            value={selectedDivision || ""}
            onChange={(e) => handleDivisionChange?.(e.target.value)}
            className={styles.dropdown}
            aria-label="Select Division"
            disabled={!divisions?.length}
          >
            <option value="">Select Division</option>
            {divisions?.map((division) => (
              <option key={division.code} value={division.code}>
                {division.name}
              </option>
            ))}
          </select>
        </div>
      
        <div className={styles.dropdownWrapper}>
          <PiMapPinAreaFill className={styles.dropdownIcon} title="Ward" />
          <select
            id="ward-select"
            value={currentWardCode || ""}
            onChange={(e) => handleWardChange?.(e.target.value)}
            className={styles.dropdown}
            aria-label="Select Ward"
            disabled={!selectedDivision || !wards?.length}
          >
            <option value="">Select Ward</option>
            {wards?.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className={styles.leadership}>
        {wardInfo?.convenor?.name && (
          <p>
            <strong>Convenor</strong> {wardInfo.convenor.name}
          </p>
        )}

        {wardInfo?.coConvenor?.name && (
          <p>
            <strong>Co-Convenor</strong> {wardInfo.coConvenor.name}
          </p>
        )}
      </div>
    </div>
  );
}