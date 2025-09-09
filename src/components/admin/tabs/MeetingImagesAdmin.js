import { useState } from "react";
import useMeetingImages from "hooks/useMeetingImages";
import styles from "styles/layout/admin.module.css";

export default function MeetingImagesAdmin({ meetingId, wardId }) {
  const { images, resolveUrl, upload, remove } = useMeetingImages(meetingId);
  const [pendingFiles, setPendingFiles] = useState([]);

  const handleUpload = async () => {
    for (const file of pendingFiles) {
      try {
        await upload(wardId, file);
      } catch (err) {
        alert(`Upload failed: ${err.message}`);
      }
    }
    setPendingFiles([]);
  };

  return (
    <div className={styles.imagesAdmin}>
      <h4>Images</h4>
      <div className={styles.imageThumbs}>
        {images.map((img) => (
          <div key={img.id} className={styles.imageWrapper}>
            <img src={resolveUrl(img.path)} alt="" />
            <button onClick={() => remove(img)}>✕</button>
          </div>
        ))}
      </div>

      {pendingFiles.length > 0 && (
        <div className={styles.preview}>
          {pendingFiles.map((file, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt="Preview"
              className={styles.previewImg}
            />
          ))}
          <button onClick={handleUpload}>Confirm Upload</button>
          <button onClick={() => setPendingFiles([])}>Cancel</button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setPendingFiles(Array.from(e.target.files))}
      />
    </div>
  );
}
