// components/DriveEmbed.js
import { useState } from "react";
import styles from "styles/components/data/driveembed.module.css";

export default function DriveEmbed({ driveLink, title = "Document Preview" }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Extract file ID from various Google Drive URL formats
  const extractFileId = (url) => {
    if (!url) return null;
    
    // Handle different Google Drive URL formats
    const match1 = url.match(/\/file\/d\/([^\/]+)/);
    if (match1) return match1[1];
    
    const match2 = url.match(/id=([^&]+)/);
    if (match2) return match2[1];
    
    const match3 = url.match(/[-\w]{25,}/);
    if (match3) return match3[0];
    
    return null;
  };

  const fileId = extractFileId(driveLink);
  const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;

  if (!driveLink || !fileId) {
    return (
      <div className={styles.driveEmbed}>
        <div className={styles.error}>
          Invalid Google Drive link provided
        </div>
      </div>
    );
  }

  return (
    <div className={styles.driveEmbed}>
      <div className={styles.driveHeader}>
        <span>{title}</span>
        <button 
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className={styles.embedContainer}>
          <iframe
            src={embedUrl}
            className={styles.driveIframe}
            title={title}
            allow="autoplay"
          />
          <div className={styles.driveActions}>
            <a 
              href={driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openDriveLink}
            >
              Open in Google Drive
            </a>
          </div>
        </div>
      )}
    </div>
  );
}