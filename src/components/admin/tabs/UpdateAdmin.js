// components/admin/UpdateAdmin.js
import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useAuth } from "context/AuthContext";
import useAdminUpdates from "hooks/useAdminUpdates";
import useWardCRUD from "hooks/useWardCRUD";
import { useAlert } from "hooks/useAlert";
import UpdateCard from "components/shared/UpdateCard";
import UpdateForm from "components/shared/UpdateForm";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/timeline.module.css";
import { FaPlus } from "react-icons/fa";
import useUpdateImages from "hooks/useUpdateImages";
import UpdateImageManager from "components/admin/UpdateImageManager";
import ImageStackPopup from "components/shared/image/ImageStackPopup";

export default function UpdateAdmin() {
  const { wardId } = useWard();
  const { getAccessToken } = useAuth();
  const { updates, loading, error, setUpdates } = useAdminUpdates(wardId);
  const { create, update, remove } = useWardCRUD("update", wardId);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);
  const [expandedUpdateId, setExpandedUpdateId] = useState(null);

  const refreshUpdates = async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/ward/${wardId}/update/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUpdates(data || []);
      }
    } catch (err) {
      console.error("Failed to refresh monthly updates:", err);
      showErrorAlert({ message: "Failed to refresh monthly updates", errorDetails: err.message });
    }
  };

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      setShowAddForm(false);
      showSuccessAlert({ message: "Monthly Update created successfully!" });
      refreshUpdates();
    } catch (err) {
      console.error("Failed to create Monthly Update:", err);
      showErrorAlert({ message: "Failed to create Monthly Update", errorDetails: err.message });
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await update(id, formData);
      setEditingId(null);
      showSuccessAlert({ message: "Monthly Update updated successfully!" });
      refreshUpdates();
    } catch (err) {
      console.error("Failed to update monthly update:", err);
      showErrorAlert({ message: "Failed to update Monthly Update", errorDetails: err.message });
    }
  };

  const handleDelete = async (id) => {
    showConfirmAlert({
      title: "Delete Update",
      message: "Are you sure you want to delete this Monthly Update?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(id);
          showSuccessAlert({ message: "Monthly Update deleted successfully!" });
          refreshUpdates();
        } catch (err) {
          console.error("Failed to delete update:", err);
          showErrorAlert({ message: "Failed to delete Monthly Update", errorDetails: err.message });
        }
      }
    });
  };

  if (loading) return <Spinner />;
  if (error) {
    showErrorAlert({ message: "Error loading Monthly Updates", errorDetails: error });
    return <div>Error loading updates</div>;
  }

  const toggleImageManager = (updateId) => {
    setExpandedUpdateId(expandedUpdateId === updateId ? null : updateId);
  };

  // Compact Image Container Component
  const CompactImageContainer = ({ updateId, onImageClick }) => {
    const { images, resolveUrl } = useUpdateImages(updateId);
    
    const handleClick = () => {
      onImageClick(images.map(img => resolveUrl(img.path)));
    };

    if (images.length === 0) return null;

    return (
      <div className={styles.compactImageSection}>        
        <div className={styles.compactImageGrid}>
          {images.slice(0, 4).map((img, idx) => (
            <div key={idx} className={styles.compactImageWrapper}>
              <img
                src={resolveUrl(img.path)}
                alt={`Update image ${idx + 1}`}
                onClick={handleClick}
                className={styles.compactImage}
              />
              {idx === 3 && images.length > 4 && (
                <div className={styles.moreImagesOverlay}>
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <AlertComponent />

      <div className={styles.addButtonContainer}>
        <motion.button 
          className={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        > 
          <FaPlus className={styles.addButtonIconFa} />
          <div className={styles.addButtonText}>Add Monthly Update</div>
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={styles.formContainer}
        >
          <UpdateForm
            onSave={handleCreate}
            onCancel={() => setShowAddForm(false)}
          />
        </motion.div>
      )}

      <div className={styles.timelineWrapper}>
        {updates.length === 0 ? (
          <p className={styles.emptyTimeline}>No updates yet.</p>
        ) : (
          <div className={styles.desktopView}>
            {updates.map((item, index) => (
              <div key={item.id} className={styles.timelineItemUpdate}>
                <div
                  className={styles.centeredDate}
                  style={{ cursor: "auto" }}
                >
                  {new Date(item.date).toLocaleDateString("en-US", { 
                    month: "long", 
                    year: "numeric" 
                  })}
                </div>

                <div className={styles.fullWidthCard}>
                  <UpdateCard
                    item={item}
                    index={index}
                    isAdmin={true}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onCancelEdit={() => setEditingId(null)}
                  />
                  
                  {/* Image Management Section */}
                  <div className={styles.imageManagerToggle}>
                    <button 
                      onClick={() => toggleImageManager(item.id)}
                      className={styles.toggleButton}
                    >
                      {expandedUpdateId === item.id ? "Hide Images" : "Manage Images"}
                    </button>
                  </div>
                  
                  {expandedUpdateId === item.id && (
                    <UpdateImageManager updateId={item.id} wardId={wardId} />
                  )}

                  <CompactImageContainer
                    updateId={item.id} 
                    wardId={wardId}
                    onImageClick={(images) => {
                      setPopupImages(images);
                      setIsPopupOpen(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isPopupOpen && (
        <ImageStackPopup
          images={popupImages}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}