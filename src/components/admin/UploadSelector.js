import { useState } from "react";
import styles from "styles/components/uploadselector.module.css";

export default function UploadSelector({ onUpload }) {
  const [type, setType] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    onUpload(type, files);
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    const link = e.target.link.value;
    onUpload(type, link);
    e.target.reset();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(type, e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`${styles.uploadSelector} ${dragging ? styles.dragging : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <label>Choose Content Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className={styles.typeSelect}
      >
        <option value="">Select type...</option>
        <option value="image">Single Image</option>
        <option value="stack">Image Stack</option>
        <option value="comparison-before">Before Images</option>
        <option value="comparison-after">After Images</option>
        <option value="document">PDF/Document</option>
        <option value="drive">Google Drive Embed</option>
      </select>

      {(type === "image" ||
        type === "stack" ||
        type.startsWith("comparison")) && (
        <input
          type="file"
          multiple={type !== "image"}
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
      )}

      {type === "document" && (
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
      )}

      {type === "drive" && (
        <form onSubmit={handleLinkSubmit} className={styles.driveForm}>
          <input
            type="url"
            name="link"
            placeholder="Paste Google Drive link"
            required
          />
          <button type="submit">Embed</button>
        </form>
      )}
    </div>
  );
}
