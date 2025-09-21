// components/admin/ImageManager.js
import { useState, useRef } from "react";
import useMeetingImages from "hooks/useMeetingImages";
import { useAlert } from "hooks/useAlert";
import styles from "styles/layout/admin.module.css";
import { FaTrash } from "react-icons/fa";

export default function ImageManager({ meetingId, wardId }) {
  const { images, resolveUrl, upload, remove, loading } = useMeetingImages(meetingId);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();
  
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
      showSuccessAlert({ message: "Images uploaded successfully!" });
    } catch (error) {
      setUploadError(error.message);
      showErrorAlert({ message: "Failed to upload images", errorDetails: error.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (image) => {
    showConfirmAlert({
      title: "Delete Image",
      message: "Are you sure you want to delete this image?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(image);
          showSuccessAlert({ message: "Image deleted successfully!" });
        } catch (error) {
          console.error("Failed to delete image:", error);
          showErrorAlert({ message: "Failed to delete image", errorDetails: error.message });
        }
      }
    });
  };

  return (
    <div className={styles.imagesAdmin}>
      {/* Alert Component */}
      <AlertComponent />
      
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
        {uploadError && showErrorAlert({ message: `Upload error: ${uploadError}` })}
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
              <FaTrash />
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