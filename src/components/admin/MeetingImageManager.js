// components/admin/MeetingImageManager.js
import { useState } from "react";
import { useAlert } from "hooks/useAlert";
import { useMeetingImages } from "hooks/useImages";
import FileUploader from "components/shared/FileUploader";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "styles/components/data/imagemanager.module.css";
import { FiFile } from "react-icons/fi";

export default function MeetingImageManager({ meetingId, wardCode }) {
  const { files, loading, upload, remove, resolveUrl, refresh } = useMeetingImages(meetingId, wardCode);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupFiles, setPopupFiles] = useState([]);
  const [uploadType, setUploadType] = useState("image");

  const handleUpload = async (file) => {
    try {
      await upload(file, "general", uploadType);
      showSuccessAlert({ message: "File uploaded successfully!" });
    } catch (err) {
      showErrorAlert({ message: "Failed to upload file", errorDetails: err.message });
    }
  };

  const handleDelete = (file) => {
    showConfirmAlert({
      title: "Delete File?",
      message: `Are you sure you want to delete ${file.path.split('/').pop()}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(file);
          showSuccessAlert({ message: "File deleted successfully!" });
        } catch (err) {
          showErrorAlert({ message: "Failed to delete file", errorDetails: err.message });
        }
      },
    });
  };

  const openPopup = (files) => {
    setPopupFiles(files.map((file) => resolveUrl(file.path)));
    setIsPopupOpen(true);
  };

  return (
    <div className={styles.imageManager}>
      <AlertComponent />

      <div className={styles.managerHeader}>
        <h4>Files for Meeting</h4>
        <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
          <option value="image">Single Image</option>
          <option value="stack">Image Stack</option>
          <option value="comparison-before">Before</option>
          <option value="comparison-after">After</option>
          <option value="document">Document</option>
        </select>
      </div>

      <FileUploader
        onUpload={handleUpload}
        onDelete={handleDelete}
        uploadedFiles={files}
        accept={uploadType === "document" ? ".pdf,.doc,.docx,.txt" : "image/*"}
        multiple
        maxFiles={10}
        label={`Upload ${uploadType.replace("-", " ")} files`}
        loading={loading}
      />

      {files.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewGrid}>
            {files.map((file) => (
              <div key={file.id} className={styles.previewItem}>
                {file.type === "document" ? (
                  <div className={styles.documentPreview}>
                    <FiFile className={styles.documentIcon} />
                    <span>{file.path.split("/").pop()}</span>
                    <a href={resolveUrl(file.path)} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </div>
                ) : (
                  <img
                    src={resolveUrl(file.path)}
                    alt={file.type}
                    className={styles.previewImage}
                    onClick={() => openPopup([file])}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isPopupOpen && <ImageStackPopup files={popupFiles} onClose={() => setIsPopupOpen(false)} />}
    </div>
  );
}