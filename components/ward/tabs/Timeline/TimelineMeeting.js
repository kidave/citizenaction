import { useState, useEffect } from 'react';
import TimelineItemMeeting from './TimelineItemMeeting';
import styles from '../../../../styles/layout/timeline.module.css';
import { useForum } from '../../../../src/context/ForumContext';
import { supabase } from '../../../../utils/supabaseClient';
import { useWard } from '../../../../src/context/WardContext';
import { FaUsers } from 'react-icons/fa';

export default function TimelineMeeting({ meetings: initialMeetings }) {
  const { user } = useForum();
  const { wardId } = useWard();

  const [isConvenor, setIsConvenor] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [meetings, setMeetings] = useState(initialMeetings);

  useEffect(() => {
    if (!user || !wardId) return;

    const checkConvenor = async () => {
      const { data } = await supabase
        .from('profile')
        .select('is_convenor, is_co_convenor, ward_code')
        .eq('user_id', user.id)
        .single();

      setIsConvenor(
        (data?.is_convenor || data?.is_co_convenor) &&
        data?.ward_code === wardId
      );
    };

    checkConvenor();
  }, [user, wardId]);

  const handleAddClick = () => {
    setShowNew(true);
  };

  const refreshMeetings = async () => {
    const { data, error } = await supabase
      .from('meeting')
      .select('*')
      .eq('ward_code', wardId)
      .order('date', { ascending: false });

    if (!error) setMeetings(data || []);
  };

  return (
    <div className={styles.timelineWrapper}>
      {isConvenor && (
        <div className={styles.addMeetingIconWrapper} onClick={handleAddClick}>
          <FaUsers className={styles.addMeetingIcon} />
          <div className={styles.addMeetingText}>Add Meeting</div>
        </div>
      )}

      {showNew && (
        <TimelineItemMeeting
          key="new-meeting"
          item={{
            id: null,
            title: '',
            location: '',
            notable_attendees: '',
            discussion: '',
            mood_rating: 5,
            date: '',
            ward_code: wardId
          }}
          index={-1}
          isConvenor={isConvenor}
          isNew
          onCloseNew={() => setShowNew(false)}
          onSaveComplete={refreshMeetings}
        />
      )}

      {meetings.length === 0 && !showNew ? (
        <p className={styles.emptyTimeline}>No meetings yet.</p>
      ) : (
        meetings.map((item, index) => (
          <TimelineItemMeeting
            key={item.id}
            item={item}
            index={index}
            isConvenor={isConvenor}
            onSaveComplete={refreshMeetings}
          />
        ))
      )}
    </div>
  );
}
