// components/admin/AnnouncementFileManager.js
import { useState } from "react";
import { useAlert } from "hooks/useAlert";
import { useAnnouncementFiles } from "hooks/useStorage";
import FileUploader from "components/shared/FileUploader";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "styles/components/data/imagemanager.module.css";
import { FiFile } from "react-icons/fi";

export default function AnnouncementFileManager({ announcementId, wardCode }) {
  // Ensure both announcementId and wardCode are available
  const { files, loading, upload, remove, resolveUrl } = useAnnouncementFiles(announcementId, wardCode);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupFiles, setPopupFiles] = useState([]);
  const [uploadType, setUploadType] = useState("image");

  const handleUpload = async (file) => {
    try {
      // Validate that we have the required parameters
      if (!announcementId || !wardCode) {
        throw new Error("Announcement must be saved before uploading files");
      }
      
      await upload(file, "general", uploadType);
      showSuccessAlert({ message: "File uploaded successfully!" });
    } catch (err) {
      console.error("Upload error:", err);
      showErrorAlert({ 
        message: "Failed to upload file", 
        errorDetails: err.message 
      });
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

  // Don't render if missing required props
  if (!announcementId || !wardCode) {
    return (
      <div className={styles.imageManager}>
        <div className={styles.errorMessage}>
          Unable to load file manager. Missing announcement information.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.imageManager}>
      <AlertComponent />

      <div className={styles.managerHeader}>
        <h4>Files for Announcement</h4>
        <select 
          value={uploadType} 
          onChange={(e) => setUploadType(e.target.value)}
          className={styles.typeSelector}
        >
          <option value="image">Image</option>
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
        label={`Upload ${uploadType} files`}
        loading={loading}
      />

      {files.length > 0 && (
        <div className={styles.previewSection}>
          <h5>Uploaded Files ({files.length})</h5>
          <div className={styles.previewGrid}>
            {files.map((file) => (
              <div key={file.id} className={styles.previewItem}>
                {file.type === "document" ? (
                  <div className={styles.documentPreview}>
                    <FiFile className={styles.documentIcon} />
                    <span className={styles.fileName}>{file.path.split("/").pop()}</span>
                    <a 
                      href={resolveUrl(file.path)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.viewLink}
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <img
                    src={resolveUrl(file.path)}
                    alt="Announcement attachment"
                    className={styles.previewImage}
                    onClick={() => openPopup([file])}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isPopupOpen && (
        <ImageStackPopup 
          files={popupFiles} 
          onClose={() => setIsPopupOpen(false)} 
        />
      )}
    </div>
  );
}