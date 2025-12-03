// components/shared/ui/CountdownTimer.js
import { useState, useEffect } from 'react';
import { 
  differenceInDays, 
  differenceInHours, 
  differenceInMinutes, 
  differenceInSeconds,
  isBefore 
} from 'date-fns';
import { FaClock } from 'react-icons/fa';
import styles from 'styles/components/feedback/CountdownTimer.module.css';

export default function CountdownTimer({ 
  targetDate, 
  liveText = "Meeting in progress", 
  endedText = "Meeting ended",
  noMeetingText = "No meeting scheduled"
}) {
  const [timeLeft, setTimeLeft] = useState({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });
  const [isLive, setIsLive] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(targetDate);
      
      // Check if meeting has ended (1.5 hours after start)
      const meetingEnd = new Date(target.getTime() + (90 * 60 * 1000));
      
      if (now > meetingEnd) {
        setHasEnded(true);
        setIsLive(false);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else if (isBefore(now, target)) {
        // Meeting hasn't started yet
        setHasEnded(false);
        setIsLive(false);
        const days = Math.max(0, differenceInDays(target, now));
        const hours = Math.max(0, differenceInHours(target, now) % 24);
        const minutes = Math.max(0, differenceInMinutes(target, now) % 60);
        const seconds = Math.max(0, differenceInSeconds(target, now) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Meeting is live (current time is between start and end)
        setHasEnded(false);
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <div className={styles.countdownContainer}>
        <FaClock className={styles.countdownIcon} />
        <span>{noMeetingText}</span>
      </div>
    );
  }

  if (hasEnded) {
    return (
      <div className={styles.countdownContainer}>
        <FaClock className={styles.countdownIcon} />
        <span>{endedText}</span>
      </div>
    );
  }

  if (isLive) {
    return (
      <div className={styles.countdownContainer}>
        <FaClock className={styles.countdownIcon} />
        <span className={styles.liveText}>{liveText}</span>
      </div>
    );
  }

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className={styles.countdownContainer}>
      <FaClock className={styles.countdownIcon} />
      <div className={styles.timeUnits}>
        {timeLeft.days > 0 && (
          <div className={styles.timeUnit}>
            <span className={styles.timeValue}>{formatNumber(timeLeft.days)}</span>
            <span className={styles.timeLabel}>days</span>
          </div>
        )}
        <div className={styles.timeUnit}>
          <span className={styles.timeValue}>{formatNumber(timeLeft.hours)}</span>
          <span className={styles.timeLabel}>hours</span>
        </div>
        <div className={styles.timeUnit}>
          <span className={styles.timeValue}>{formatNumber(timeLeft.minutes)}</span>
          <span className={styles.timeLabel}>minutes</span>
        </div>
        <div className={styles.timeUnit}>
          <span className={styles.timeValue}>{formatNumber(timeLeft.seconds)}</span>
          <span className={styles.timeLabel}>seconds</span>
        </div>
      </div>
    </div>
  );
}