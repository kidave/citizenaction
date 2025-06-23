import styles from '../styles/layout/about.module.css';
import { FaUsers, FaMapMarkedAlt, FaHandsHelping, FaMapSigns, FaMousePointer, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

export default function About({ show = true, onClose }) {
  if (!show) return null;

  return (
    <section className={styles.about}>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close About">
          <FaTimes />
        </button>
      )}
      <div className={styles.iconRow}>
        <FaUsers className={styles.icon} />
        <FaMapMarkedAlt className={styles.icon} />
        <FaHandsHelping className={styles.icon} />
      </div>
      <h2 className={styles.title}>Improving our Footpaths, One Ward at a Time</h2>
      <p className={styles.text}>
        <strong>Walking Project</strong> is a citizen-driven initiative to make our neighborhoods more walkable, inclusive, and vibrant. 
        Through <span className={styles.highlight}>ward committees</span>, we bring together residents, local leaders, and volunteers and civic officials to identify walkability issues, propose changes, foster collaboration and track progress, for walkable streets and public spaces. 
        <span className={styles.emphasis}>Join us in building a connected, safe, and healthy city, starting from your own ward!</span>
      </p>
      <div className={styles.infoRow}>
        <FaMapSigns className={styles.infoIcon} />
        <FaMousePointer className={styles.infoIcon} />
        <span className={styles.infoText}>
          <strong>Tip:</strong> Click on your <span className={styles.highlight}>city</span> and then your <span className={styles.highlight}>ward</span> to check progress, view updates, and get involved!{' '}
          <Link href="https://drive.google.com/file/d/1IXXgyc-Y2GNQvqsr5gwZQDx8PqTRP1y7/view" className={styles.learnMore}>Learn more!</Link>
        </span>
      </div>
    </section>
  );
}