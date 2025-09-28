// components/ward/WardHeader.js
import styles from "styles/layout/wardheader.module.css";
import { useWard } from "context/WardContext";

export default function WardHeader({ showHeader = true }) {
  const { wardInfo } = useWard();

  if (!showHeader) return null;

  return (
    <div className={styles.wardHeader}>
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