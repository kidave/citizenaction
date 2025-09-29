// components/ward/WardHeader.js
import styles from "styles/layout/wardheader.module.css";
import { useWard } from "context/WardContext";
import { PiMapPinAreaFill } from "react-icons/pi";
import { FaMap } from "react-icons/fa";
import { useRouter } from "next/router";
import { useRegionData } from "hooks/useRegionData";

export default function WardHeader({ showHeader = true }) {
  const { wardInfo } = useWard();
  const router = useRouter();
  const { wardId } = router.query;

  const {
    divisions,
    wards,
    selectedDivision,
    handleDivisionChange,
    handleWardChange
  } = useRegionData();

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
            onChange={(e) => handleDivisionChange(e.target.value)}
            className={styles.dropdown}
            aria-label="Select Division"
          >
          <option value="">Select Division</option>
            {divisions.map((division) => (
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
            value={wardId || ""}
            onChange={(e) => handleWardChange(e.target.value)}
            className={styles.dropdown}
            aria-label="Select Ward"
            disabled={!selectedDivision}
          >
          <option value="">Select Ward</option>
            {wards.map((ward) => (
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