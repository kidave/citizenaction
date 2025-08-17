// components\ward\tabs\Timeline\TimelineUpdate.js
import { useState, useEffect } from "react";
import TimelineItemUpdate from "./TimelineItemUpdate";
import styles from "styles/layout/timeline.module.css";
import { useWard } from "context/WardContext";
import { useAuth } from "context/AuthContext";
import { supabase } from "utils/supabaseClient";
import { FaUsers, FaPlus } from "react-icons/fa";

export default function TimelineUpdate({ updates: initialUpdates }) {
  const { user } = useAuth();
  const { wardId } = useWard();

  const [isConvenor, setIsConvenor] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [updates, setUpdates] = useState(initialUpdates);

  useEffect(() => {
    if (!user || !wardId) return;

    const checkConvenor = async () => {
      const { data, error } = await supabase
        .from("committee")
        .select("role_id")
        .eq("user_id", user.id)
        .eq("ward_code", wardId)
        .single();

      setIsConvenor(data?.role_id === 1 || data?.role_id === 2); // 1 = convenor, 2 = co-convenor
    };

    checkConvenor();
  }, [user, wardId]);

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
      {isConvenor && (
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
          isConvenor={isConvenor}
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
            isConvenor={isConvenor}
            onSaveComplete={refreshUpdates}
          />
        ))
      )}
    </div>
  );
}
