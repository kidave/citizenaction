import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MeetingDetails from './MeetingDetails';
import styles from '../../../../styles/layout/timeline.module.css';
import { FaUsers } from 'react-icons/fa';
import { supabase } from '../../../../utils/supabaseClient';
import { useWard } from '../../../../src/context/WardContext';

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TimelineItemMeeting({ item, index, isConvenor, isNew, onCloseNew, onSaveComplete }) {
  const { wardId } = useWard();
  const [active, setActive] = useState(index === 0);
  const [isEditing, setIsEditing] = useState(isNew || false);
  const [loading, setLoading] = useState(false);

  const isLeft = index % 2 === 0;

  const handleSave = async (updatedItem) => {
    setLoading(true);
    try {
      const payload = {
        ward_code: wardId,
        title: updatedItem.title,
        location: updatedItem.location,
        discussion: Array.isArray(updatedItem.discussion)
          ? updatedItem.discussion.join('\n')
          : updatedItem.discussion,
        mood_rating: updatedItem.mood_rating ? parseInt(updatedItem.mood_rating, 10) : null,
        notable_attendees: updatedItem.notable_attendees || null,
        date: updatedItem.date || new Date().toISOString().split('T')[0]
      };

      let error;

      if (updatedItem.id) {
        ({ error } = await supabase
          .from('meeting')
          .update(payload)
          .eq('id', updatedItem.id));
      } else {
        ({ error } = await supabase
          .from('meeting')
          .insert([payload]));
      }

      if (error) throw error;

      setIsEditing(false);
      if (isNew && onCloseNew) onCloseNew();
      if (onSaveComplete) onSaveComplete();
    } catch (err) {
      console.error('Error saving meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className={`${styles.timelineCard} ${styles.meetingCard}`}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.timelineCardTitle}>{item.title || 'New Meeting'}</h4>
        <span className={styles.cardTypeBadge}>Meeting</span>
      </div>
      <MeetingDetails
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
  );

  return (
    <div className={`${styles.timelineItemMeeting} ${isLeft ? styles.left : styles.right}`}>
      <div className={styles.timelineSide}>
        <AnimatePresence>
          {isLeft && active && renderCard()}
        </AnimatePresence>
      </div>

      <div className={styles.timelineIconWrapper} onClick={() => setActive(!active)}>
        <FaUsers className={styles.timelineIconFa} />
        <div className={`${styles.timelineDateWrapper} ${isLeft ? styles.rightDate : styles.leftDate}`}>
          {formatDate(item.date)}
        </div>
      </div>

      <div className={styles.timelineSide}>
        <AnimatePresence>
          {!isLeft && active && renderCard()}
        </AnimatePresence>
      </div>
    </div>
  );
}
