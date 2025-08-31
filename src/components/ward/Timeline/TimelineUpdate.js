// components\ward\tabs\Timeline\TimelineUpdate.js
import { useState } from "react";
import TimelineItemUpdate from "./TimelineItemUpdate";
import styles from "styles/layout/timeline.module.css";
import { useWard } from "context/WardContext";
import { supabase } from "utils/supabaseClient";
import { FaPlus } from "react-icons/fa";
import { useAdmin } from "context/AdminContext";

export default function TimelineUpdate({ updates: initialUpdates }) {
  const { wardId } = useWard();
  const { isAdmin } = useAdmin();

  const [showNew, setShowNew] = useState(false);
  const [updates, setUpdates] = useState(initialUpdates);

  const handleAddClick = () => {
    setShowNew(true);
  };

  const refreshUpdates = async () => {
    const { data, error } = await supabase
      .from("update")
      .select("*")
      .eq("ward_code", wardId)
      .order("date", { ascending: false });

    if (!error) setUpdates(data || []);
  };

  return (
    <div className={styles.timelineWrapper}>
      {isAdmin && (
        <div className={styles.addMeetingIconWrapper} onClick={handleAddClick}>
          <FaPlus className={styles.addMeetingIcon} />
          <div className={styles.addMeetingText}>Add Update</div>
        </div>
      )}

      {showNew && (
        <TimelineItemUpdate
          key="new-update"
          item={{
            id: null,
            operation: "",
            description: "",
            support: "",
            date: "",
            ward_code: wardId,
          }}
          index={-1}
          isAdmin={isAdmin}
          isNew
          onCloseNew={() => setShowNew(false)}
          onSaveComplete={refreshUpdates}
        />
      )}

      {updates.length === 0 && !showNew ? (
        <p className={styles.emptyTimeline}>No updates yet.</p>
      ) : (
        updates.map((item, index) => (
          <TimelineItemUpdate
            key={item.id}
            item={item}
            index={index}
            isAdmin={isAdmin}
            onSaveComplete={refreshUpdates}
          />
        ))
      )}
    </div>
  );
}
