// components/shared/FileUploader.js
import { useState, useRef } from "react";
import { useAlert } from "hooks/useAlert";
import styles from "styles/components/data/fileuploader.module.css";
import { FiUpload, FiFile, FiImage, FiX } from "react-icons/fi";

export default function FileUploader({
  onUpload,
  onDelete,
  uploadedFiles = [],
  accept = "image/*",
  multiple = true,
  maxFiles = 10,
  label = "Upload Files",
  loading = false,
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const { showErrorAlert, AlertComponent } = useAlert();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    if (files.length + uploadedFiles.length > maxFiles) {
      showErrorAlert({ 
        message: `Maximum ${maxFiles} files allowed. You have ${uploadedFiles.length} files already.` 
      });
      return;
    }

    try {
      for (const file of files) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        await onUpload(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        });
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    } catch (error) {
      showErrorAlert({ message: "Failed to upload files", errorDetails: error.message });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FiImage className={styles.fileIcon} />;
    return <FiFile className={styles.fileIcon} />;
  };

  const getFileType = (fileName) => {
    if (fileName.includes('.pdf')) return 'PDF';
    if (fileName.includes('.doc')) return 'Document';
    if (fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.jpeg')) return 'Image';
    return 'File';
  };

  return (
    <div className={styles.fileUploader}>
      <AlertComponent />
      
      {/* Upload Area */}
      <div
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || loading}
          className={styles.fileInput}
        />
        
        <div className={styles.uploadContent}>
          <FiUpload className={styles.uploadIcon} />
          <div className={styles.uploadText}>
            <p className={styles.uploadTitle}>{label}</p>
            <p className={styles.uploadSubtitle}>
              Drag & drop files here or click to browse
            </p>
            <p className={styles.uploadInfo}>
              Accepted: {accept === "image/*" ? "Images" : "All files"} • Max: {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className={styles.progressSection}>
          <h4>Uploading Files</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className={styles.progressItem}>
              <span className={styles.fileName}>{fileName}</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={styles.progressText}>{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className={styles.uploadedFiles}>
          <h4>Uploaded Files ({uploadedFiles.length}/{maxFiles})</h4>
          <div className={styles.fileList}>
            {uploadedFiles.map((file, index) => (
              <div key={file.id || index} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  {getFileIcon(file.type || file.path)}
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>
                      {file.name || file.path.split('/').pop()}
                    </span>
                    <span className={styles.fileType}>
                      {getFileType(file.path || file.name)}
                      {file.step && ` • Step ${file.step}`}
                      {file.type && ` • ${file.type.replace('-', ' ')}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                  }}
                  className={styles.deleteButton}
                  disabled={disabled}
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}