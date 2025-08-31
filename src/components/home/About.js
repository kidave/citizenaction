// components/About.js
import styles from "styles/layout/about.module.css";
import {
  FaMapSigns,
  FaMousePointer,
} from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import Link from "next/link";
import { useState } from "react";

export default function About() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <section className={styles.about}>
      {/* Floating elements - ACTUAL HTML ELEMENTS */}
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>
      
      {/* Collapse Button */}
      <button
        className={styles.closeBtn}
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Expand About" : "Collapse About"}
      >
        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {/* Collapsible Content */}
      <div
        className={`${styles.content} ${
          isCollapsed ? styles.collapsed : styles.expanded
        }`}
      >
        <h2>
          Ward{" "}
          <span className={styles.highlight}>Committee</span>
        </h2>

        <p className={styles.text}>
          <span className={styles.highlight}>Walking Project</span> is a citizen-driven initiative to
          make our neighborhoods more walkable, inclusive, and vibrant. Through{" "}
          <span className={styles.highlight}>ward committees</span>, we bring
          together residents, local leaders, volunteers and civic officials to
          identify walkability issues, propose changes, foster collaboration and
          track progress, for walkable streets and public spaces.
          <span className={styles.emphasis}>
            Join us in making cities walkable, starting from your own ward!
          </span>
        </p>
      </div>

      {/* Always Visible Info Row */}
      <div className={styles.infoRow}>
        <FaMapSigns className={styles.infoIcon} />
        <FaMousePointer className={styles.infoIcon} />
        <span className={styles.infoText}>
          <strong>Tip:</strong> Click on your{" "}
          <span className={styles.highlight}>city</span> and then your{" "}
          <span className={styles.highlight}>ward</span> to check progress, view
          updates, and get involved!{" "}
          <Link
            href="https://drive.google.com/file/d/1IXXgyc-Y2GNQvqsr5gwZQDx8PqTRP1y7/view"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.learnMore}
          >
            Learn more!
          </Link>
        </span>
      </div>
    </section>
  );
}