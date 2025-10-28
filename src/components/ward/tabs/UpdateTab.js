// components/ward/tabs/UpdateTab.js
import { useState } from "react";
import { useWard } from "context/WardContext";
import { useWardUpdates } from "hooks/useWardData";
import UpdateCard from "components/shared/card/UpdateCard";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "styles/tabs/timeline.module.css";

export default function UpdateTab() {
  const { wardCode } = useWard();
  const { data: updates, loading, error } = useWardUpdates(wardCode);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupFiles, setPopupFiles] = useState([]);

  if (loading) return <p>Loading updates...</p>;
  if (error) return <div>Error loading updates: {error.message}</div>;

  return (
    <>
      <div className={styles.timelineWrapper}>
        {updates.length === 0 ? (
          <p className={styles.emptyTimeline}>No monthly updates yet.</p>
        ) : (
          <div className={styles.desktopView}>
            {updates.map((update, index) => (
              <UpdateCard
                key={update.id}
                item={update}
                index={index}
                editable={false}
              />
            ))}
          </div>
        )}
      </div>

      {isPopupOpen && (
        <ImageStackPopup files={popupFiles} onClose={() => setIsPopupOpen(false)} />
      )}
    </>
  );
}