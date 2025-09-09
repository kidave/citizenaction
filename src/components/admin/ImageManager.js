// components/admin/ImageManager.js
import { useState, useRef } from "react";
import useMeetingImages from "hooks/useMeetingImages";
import styles from "styles/layout/admin.module.css";

export default function ImageManager({ meetingId, wardId }) {
  const { images, resolveUrl, upload, remove, loading } = useMeetingImages(meetingId);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        await upload(wardId, file);
      }
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (image) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await remove(image);
      } catch (error) {
        console.error("Failed to delete image:", error);
        alert("Failed to delete image");
      }
    }
  };

  return (
    <div className={styles.imagesAdmin}>
      <div className={styles.sectionHeader}>
        Upload or Delete Images
      </div>
      {/* Upload section */}
      <div className={styles.uploadSection}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
          className={styles.fileInput}
        />
        {isUploading && <p>Uploading images...</p>}
        {uploadError && <p className={styles.error}>{uploadError}</p>}
      </div>

      {/* Image thumbnails */}
      <div className={styles.imageThumbs}>
        {images.map((img) => (
          <div key={img.id} className={styles.imageWrapper}>
            <img src={resolveUrl(img.path)} alt="Meeting image" />
            <button 
              onClick={() => handleDeleteImage(img)}
              className={styles.deleteImageButton}
              disabled={isUploading}
            >
              ✕
            </button>
          </div>
        ))}
        {images.length === 0 && !loading && (
          <p className={styles.noImages}>No images yet. Upload some to get started.</p>
        )}
      </div>
    </div>
  );
}