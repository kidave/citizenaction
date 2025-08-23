// components\ward\tabs\Timeline\TimelineItemUpdate.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UpdateDetails from "./UpdateDetails";
import styles from "styles/layout/timeline.module.css";
import { supabase } from "utils/supabaseClient";

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function TimelineItemUpdate({
  item,
  index,
  isConvenor,
  isNew,
  onCloseNew,
  onSaveComplete,
}) {
  const [active, setActive] = useState(isNew || index === 0);
  const [isEditing, setIsEditing] = useState(isNew || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (updatedItem) => {
    try {
      setLoading(true);

      const payload = {
        operation: updatedItem.operation,
        description: updatedItem.description,
        support: updatedItem.support,
        ward_code: updatedItem.ward_code,
        date: updatedItem.date || new Date().toISOString().split("T")[0],
      };

      let error;

      if (updatedItem.id) {
        ({ error } = await supabase
          .from("update")
          .update(payload)
          .eq("id", updatedItem.id));
      } else {
        ({ error } = await supabase.from("update").insert([payload]));
      }

      if (error) throw error;

      setIsEditing(false);
      if (onSaveComplete) onSaveComplete();
      if (isNew && onCloseNew) onCloseNew();
    } catch (err) {
      console.error("Error saving update:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.timelineItemUpdate}>
      <div
        className={styles.centeredDate}
        onClick={() => setActive(!active)}
        style={{ cursor: "pointer" }}
      >
        {formatDate(item.date)}
      </div>

      <div className={styles.fullWidthCard}>
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className={`${styles.timelineCard} ${styles.updateCard}`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTypeBadge}>Update</span>
              </div>
              <UpdateDetails
                item={item}
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={() => {
                  if (isNew && onCloseNew) onCloseNew();
                  else setIsEditing(false);
                }}
                showEdit={isConvenor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
