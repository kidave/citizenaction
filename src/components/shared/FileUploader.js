// components/shared/FileUploader.js
import { useState, useRef } from "react";
import { useAlert } from "hooks/useAlert";
import styles from "styles/components/data/fileuploader.module.css";
import { FiUpload, FiFile, FiImage, FiX } from "react-icons/fi";
import { DeleteButton } from "components/shared/ui/Buttons";

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
    // Reset the input value to allow uploading the same file again
    e.target.value = '';
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    if (files.length + uploadedFiles.length > maxFiles) {
      showErrorAlert({ 
        message: `Maximum ${maxFiles} files allowed. You have ${uploadedFiles.length} files already.` 
      });
      return;
    }

    // Validate file types if accept is specified
    if (accept !== "*/*") {
      const invalidFiles = files.filter(file => {
        if (accept.includes('image/*')) {
          return !file.type.startsWith('image/');
        }
        // Add more validation as needed
        return false;
      });

      if (invalidFiles.length > 0) {
        showErrorAlert({ 
          message: `Invalid file type. Please upload ${accept === "image/*" ? "images only" : "supported file types"}.` 
        });
        return;
      }
    }

    try {
      for (const file of files) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        await onUpload(file);
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

  const getFileIcon = (file) => {
    const fileType = file.type || '';
    const fileName = file.path || file.name || '';
    
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      return <FiImage className={styles.fileIcon} />;
    }
    if (/\.(pdf)$/i.test(fileName)) {
      return <FiFile className={styles.fileIcon} />;
    }
    return <FiFile className={styles.fileIcon} />;
  };

  const getFileType = (file) => {
    const fileName = file.path || file.name || '';
    const fileType = file.type || '';
    
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      return 'Image';
    }
    if (/\.(pdf)$/i.test(fileName)) return 'PDF';
    if (/\.(doc|docx)$/i.test(fileName)) return 'Document';
    if (/\.(txt)$/i.test(fileName)) return 'Text';
    return 'File';
  };

  const getFileName = (file) => {
    return file.name || file.path?.split('/').pop() || 'Unknown file';
  };

  const getFileDetails = (file) => {
    const details = [getFileType(file)];
    
    if (file.step) {
      details.push(`Step ${file.step}`);
    }
    
    if (file.type && file.type !== 'image') {
      details.push(file.type.replace('-', ' '));
    }
    
    return details.join(' • ');
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
        onClick={() => !disabled && !loading && fileInputRef.current?.click()}
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
            <p className={styles.uploadTitle}>
              {loading ? 'Uploading...' : label}
            </p>
            <p className={styles.uploadSubtitle}>
              Drag & drop files here or click to browse
            </p>
            <p className={styles.uploadInfo}>
              Accepted: {accept === "image/*" ? "Images" : "Various files"} • Max: {maxFiles} files
              {uploadedFiles.length > 0 && ` • ${maxFiles - uploadedFiles.length} remaining`}
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
                  {getFileIcon(file)}
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>
                      {getFileName(file)}
                    </span>
                    <span className={styles.fileType}>
                      {getFileDetails(file)}
                    </span>
                  </div>
                </div>
                <DeleteButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                  }}
                  disabled={disabled || loading}
                >
                  Delete
                </DeleteButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingState}>
          <p>Processing files...</p>
        </div>
      )}
    </div>
  );
}