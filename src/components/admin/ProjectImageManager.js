// components/admin/ProjectImageManager.js
import { useState } from "react";
import { useAlert } from "hooks/useAlert";
import useProjectImages from "hooks/useProjectImages";
import FileUploader from "components/shared/FileUploader";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "styles/components/data/imagemanager.module.css";
import { FiFile } from "react-icons/fi";

export default function ProjectImageManager({ projectId, wardId, step }) {
  const { images, loading, upload, remove, resolveUrl, refresh } = useProjectImages(wardId, projectId);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);
  const [uploadType, setUploadType] = useState("image");

  // Filter images for current step
  const stepImages = images.filter(img => img.step === step);

  const handleUpload = async (file, onProgress) => {
    try {
      await upload(file, step, uploadType);
      await refresh();
      showSuccessAlert({ message: "File uploaded successfully!" });
    } catch (error) {
      showErrorAlert({ message: "Failed to upload file", errorDetails: error.message });
      throw error;
    }
  };

  const handleDelete = async (file) => {
    showConfirmAlert({
      title: "Delete File?",
      message: `Are you sure you want to delete ${file.path.split('/').pop()}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(file);
          await refresh();
          showSuccessAlert({ message: "File deleted successfully!" });
        } catch (error) {
          showErrorAlert({ message: "Failed to delete file", errorDetails: error.message });
        }
      }
    });
  };

  const openImagePopup = (images) => {
    setPopupImages(images.map(img => resolveUrl(img.path)));
    setIsPopupOpen(true);
  };

  return (
    <div className={styles.imageManager}>
      <AlertComponent />
      
      <div className={styles.managerHeader}>
        <h4>Files for Step {step}</h4>
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value)}
          className={styles.typeSelect}
        >
          <option value="image">Single Image</option>
          <option value="stack">Image Stack</option>
          <option value="comparison-before">Before Image</option>
          <option value="comparison-after">After Image</option>
          <option value="document">Document</option>
        </select>
      </div>

      {/* File Uploader */}
      <FileUploader
        onUpload={handleUpload}
        onDelete={handleDelete}
        uploadedFiles={stepImages}
        accept={uploadType === "document" ? ".pdf,.doc,.docx,.txt" : "image/*"}
        multiple={true}
        maxFiles={10}
        label={`Upload ${uploadType.replace('-', ' ')} files`}
        loading={loading}
      />

      {/* Image Preview Grid */}
      {stepImages.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewGrid}>
            {stepImages.map((img, index) => (
              <div key={img.id} className={styles.previewItem}>
                {img.type === "document" ? (
                  <div className={styles.documentPreview}>
                    <FiFile className={styles.documentIcon} />
                    <span className={styles.documentName}>
                      {img.path.split('/').pop()}
                    </span>
                    <a 
                      href={resolveUrl(img.path)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.viewLink}
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <div className={styles.imagePreview}>
                    <img
                      src={resolveUrl(img.path)}
                      alt={`Step ${step} ${img.type}`}
                      onClick={() => openImagePopup([img])}
                      className={styles.previewImage}
                    />
                    {img.type === "stack" && stepImages.filter(i => i.type === "stack").length > 1 && (
                      <button
                        onClick={() => openImagePopup(stepImages.filter(i => i.type === "stack"))}
                        className={styles.viewAllButton}
                      >
                        View All ({stepImages.filter(i => i.type === "stack").length})
                      </button>
                    )}
                  </div>
                )}
                <div className={styles.fileMeta}>
                  <span className={styles.fileType}>{img.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Popup */}
      {isPopupOpen && (
        <ImageStackPopup
          images={popupImages}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
}
