import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UpdateDetails from './UpdateDetails';
import styles from '../../../../styles/layout/timeline.module.css';
import { supabase } from '../../../../utils/supabaseClient';

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function TimelineItemUpdate({ item, isConvenor }) {
  const [active, setActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (updatedItem) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('update')
        .update(updatedItem)
        .eq('id', item.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating update:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.timelineItemUpdate}>
      <div className={styles.centeredDate}
        onClick={() => setActive(!active)}
        style={{ cursor: 'pointer' }}
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
                <h4 className={styles.timelineCardTitle}>{item.title}</h4>
                <span className={styles.cardTypeBadge}>Update</span>
              </div>
              <UpdateDetails
                item={item}
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                showEdit={isConvenor}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
