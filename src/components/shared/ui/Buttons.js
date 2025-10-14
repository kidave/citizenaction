// components/shared/ui/Buttons.js
import { motion } from "framer-motion";
import { 
  FiSave, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiX, 
  FiCheck,
  FiDownload,
  FiUpload,
  FiPlus,
  FiSearch,
  FiImage,
  FiEyeOff
} from "react-icons/fi";
import styles from "styles/components/interact/buttons.module.css";

// Base button component
const BaseButton = ({ 
  children, 
  variant = "primary", 
  size = "medium", 
  disabled = false, 
  loading = false,
  onClick,
  type = "button",
  className = "",
  icon,
  iconPosition = "left",
  ...props 
}) => {
  return (
    <motion.button
      type={type}
      className={`${styles.baseButton} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {loading ? (
        <span className={styles.buttonContent}>
          <span className={styles.spinner}></span>
          Loading...
        </span>
      ) : (
        <span className={styles.buttonContent}>
          {icon && iconPosition === "left" && (
            <span className={styles.iconLeft}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className={styles.iconRight}>{icon}</span>
          )}
        </span>
      )}
    </motion.button>
  );
};

// Save Button
const SaveButton = ({ 
  children = "Save", 
  saving = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="success"
    loading={saving}
    icon={showIcon && !saving ? <FiSave size={16} /> : null}
    {...props}
  >
    {saving ? "Saving..." : children}
  </BaseButton>
);

// Edit Button
const EditButton = ({ 
  children = "Edit", 
  editing = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="secondary"
    loading={editing}
    icon={showIcon && !editing ? <FiEdit size={16} /> : null}
    {...props}
  >
    {editing ? "Editing..." : children}
  </BaseButton>
);

// Delete Button
const DeleteButton = ({ 
  children = "Delete", 
  deleting = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="danger"
    loading={deleting}
    icon={showIcon && !deleting ? <FiTrash2 size={16} /> : null}
    {...props}
  >
    {deleting ? "Deleting..." : children}
  </BaseButton>
);

// View Button
const ViewButton = ({ 
  children = "View", 
  viewing = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="info"
    loading={viewing}
    icon={showIcon && !viewing ? <FiEye size={16} /> : null}
    {...props}
  >
    {viewing ? "Viewing..." : children}
  </BaseButton>
);

// Cancel Button
const CancelButton = ({ 
  children = "Cancel", 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="outline"
    {...props}
  >
    {children}
  </BaseButton>
);

// Submit Button
const SubmitButton = ({ 
  children = "Submit", 
  submitting = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="success"
    loading={submitting}
    icon={showIcon && !submitting ? <FiCheck size={16} /> : null}
    {...props}
  >
    {submitting ? "Submitting..." : children}
  </BaseButton>
);

// Add/New Button
const AddButton = ({ 
  children = "Add New", 
  adding = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="primary"
    loading={adding}
    icon={showIcon && !adding ? <FiPlus size={16} /> : null}
    {...props}
  >
    {adding ? "Adding..." : children}
  </BaseButton>
);

// Download Button
const DownloadButton = ({ 
  children = "Download", 
  downloading = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="info"
    loading={downloading}
    icon={showIcon && !downloading ? <FiDownload size={16} /> : null}
    {...props}
  >
    {downloading ? "Downloading..." : children}
  </BaseButton>
);

// Upload Button
const UploadButton = ({ 
  children = "Upload", 
  uploading = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="secondary"
    loading={uploading}
    icon={showIcon && !uploading ? <FiUpload size={16} /> : null}
    {...props}
  >
    {uploading ? "Uploading..." : children}
  </BaseButton>
);

// Search Button
const SearchButton = ({ 
  children = "Search", 
  searching = false, 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="info"
    loading={searching}
    icon={showIcon && !searching ? <FiSearch size={16} /> : null}
    {...props}
  >
    {searching ? "Searching..." : children}
  </BaseButton>
);

// Publish Button
const PublishButton = ({ 
  children, 
  published = false, 
  publishing = false, 
  showIcon = true,
  ...props 
}) => {
  const buttonText = published ? "Unpublish" : "Publish";
  const icon = published ? <FiEyeOff size={16} /> : <FiEye size={16} />;
  
  return (
    <BaseButton
      variant={published ? "warning" : "success"}
      loading={publishing}
      icon={showIcon && !publishing ? icon : null}
      {...props}
    >
      {publishing ? "Updating..." : (children || buttonText)}
    </BaseButton>
  );
};

// Icon Button (for icon-only buttons)
const IconButton = ({ 
  icon, 
  size = "medium",
  variant = "ghost",
  label,
  ...props 
}) => (
  <BaseButton
    variant={variant}
    size={size}
    icon={icon}
    aria-label={label}
    {...props}
  >
    {label && <span className="sr-only">{label}</span>}
  </BaseButton>
);

// Image Button
const ImageButton = ({ 
  children = "Images", 
  showIcon = true,
  ...props 
}) => (
  <BaseButton
    variant="info"
    icon={showIcon ? <FiImage size={16} /> : null}
    {...props}
  >
    {children}
  </BaseButton>
);

// Export all buttons and base component
export default BaseButton;
export {
  SaveButton,
  EditButton,
  DeleteButton,
  ViewButton,
  CancelButton,
  SubmitButton,
  AddButton,
  DownloadButton,
  UploadButton,
  SearchButton,
  PublishButton,
  IconButton,
  ImageButton
};