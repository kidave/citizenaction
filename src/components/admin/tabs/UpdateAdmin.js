// components/admin/UpdateAdmin.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useAuth } from "context/AuthContext";
import { useAlert } from "hooks/useAlert";
import useWardCRUD from "hooks/useWardCRUD";
import useUpdateImages from "hooks/useUpdateImages";
import UpdateImageManager from "components/admin/UpdateImageManager";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import { 
  AddButton, 
  EditButton, 
  DeleteButton, 
  PublishButton,
  SaveButton,
  CancelButton,
  ImageButton
} from "components/shared/ui/Buttons";
import styles from "styles/tabs/timeline.module.css";

// Helper function to render discussion points
const renderDiscussion = (label, content) => {
  if (!content) return null;

  const points = Array.isArray(content)
    ? content
    : content.split("\n").filter((s) => s.trim());

  return (
    <div className={styles.operationSection}>
      <h5 className={styles.sectionTitle}>{label}</h5>
      <ul className={styles.discussionList}>
        {points.map((pt, i) => (
          <li key={i} className={styles.discussionPoint}>
            {pt}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Update Form Component
function UpdateForm({ update, onSave, onCancel }) {
  const [form, setForm] = useState({
    date: "",
    operation: "",
    description: "",
    support: "",
    is_published: false
  });

  useEffect(() => {
    if (update) {
      setForm({
        date: update.date ? new Date(update.date).toISOString().split('T')[0] : "",
        operation: update.operation || "",
        description: update.description || "",
        support: update.support || "",
        is_published: update.is_published || false
      });
    }
  }, [update]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={styles.formContainer}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
              />
              Publish Update
            </label>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label>Key Operations:</label>
          <textarea
            name="operation"
            value={form.operation}
            onChange={handleChange}
            placeholder="Key Operations (one per line)"
            rows="3"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (one per line)"
            rows="3"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Support Needed:</label>
          <textarea
            name="support"
            value={form.support}
            onChange={handleChange}
            placeholder="Support Needed (one per line)"
            rows="3"
          />
        </div>
        
        <div className={styles.formActions}>
          <SaveButton type="submit">Save</SaveButton>
          <CancelButton type="button" onClick={onCancel}>Cancel</CancelButton>
        </div>
      </form>
    </motion.div>
  );
}

// Update Card Component
function UpdateCard({ 
  item, 
  index, 
  onUpdate,
  onDelete,
  onPublish,
  publishingStates = {}
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (formData) => {
    await onUpdate(item.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${styles.timelineCard} ${styles.updateCard} ${styles.editingCard}`}
      >
        <UpdateForm
          update={item}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`${styles.timelineCard} ${styles.updateCard}`}
    >
      <div className={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={styles.cardTypeBadge}>
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className={`${styles.publishStatus} ${
            item.is_published ? styles.published : styles.draft
          }`}>
            {item.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PublishButton
            size="small"
            published={item.is_published}
            publishing={publishingStates[item.id]}
            onClick={() => onPublish(item)}
          />
          <EditButton 
            size="small"
            onClick={() => setIsEditing(true)}
          >
          </EditButton>
          <DeleteButton
            size="small"
            onClick={() => onDelete(item.id)}
          >
          </DeleteButton>
        </div>
      </div>
      
      <div className={styles.updateDetails}>
        {renderDiscussion("Key Operations", item.operation)}
        {renderDiscussion("Description", item.description)}
        {renderDiscussion("Support Needed", item.support)}
      </div>
    </motion.div>
  );
}

// Compact Image Container Component
function CompactImageContainer({ updateId, onImageClick }) {
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
}

// Main UpdateAdmin Component
export default function UpdateAdmin() {
  const { wardId } = useWard();
  const { getAccessToken } = useAuth();
  const { create, update, remove } = useWardCRUD("monthly_update", wardId);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);
  const [expandedUpdateId, setExpandedUpdateId] = useState(null);
  const [publishingStates, setPublishingStates] = useState({});

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const res = await fetch(`/api/ward/${wardId}/update/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUpdates(data || []);
      } else {
        throw new Error('Failed to fetch updates');
      }
    } catch (err) {
      console.error("Failed to fetch monthly updates:", err);
      setError(err.message);
      showErrorAlert({ message: "Failed to load monthly updates", errorDetails: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [wardId]);

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      setShowAddForm(false);
      showSuccessAlert({ message: "Monthly Update created successfully!" });
      await fetchUpdates();
    } catch (err) {
      console.error("Failed to create Monthly Update:", err);
      showErrorAlert({ message: "Failed to create Monthly Update", errorDetails: err.message });
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await update(id, formData);
      showSuccessAlert({ message: "Monthly Update updated successfully!" });
      await fetchUpdates();
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
          await fetchUpdates();
        } catch (err) {
          console.error("Failed to delete update:", err);
          showErrorAlert({ message: "Failed to delete Monthly Update", errorDetails: err.message });
        }
      }
    });
  };

  const handlePublishToggle = async (update) => {
    setPublishingStates(prev => ({ ...prev, [update.id]: true }));
    
    try {
      await update(update.id, { is_published: !update.is_published });
      showSuccessAlert({ 
        title: "Success!", 
        message: `Update ${!update.is_published ? 'published' : 'unpublished'} successfully.` 
      });
      await fetchUpdates();
    } catch (err) {
      showErrorAlert({ message: "Failed to update publish status", errorDetails: err.message });
    } finally {
      setPublishingStates(prev => ({ ...prev, [update.id]: false }));
    }
  };

  const toggleImageManager = (updateId) => {
    setExpandedUpdateId(expandedUpdateId === updateId ? null : updateId);
  };

  if (loading) return <div className={styles.loading}>Loading updates...</div>;
  if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

  return (
    <>
      <AlertComponent />

      <div className={styles.addButtonContainer}>
        <AddButton
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Update
        </AddButton>
      </div>

      {showAddForm && (
        <UpdateForm
          onSave={handleCreate}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className={styles.timelineWrapper}>
        {updates.length === 0 ? (
          <p className={styles.emptyTimeline}>No updates yet.</p>
        ) : (
          <div className={styles.desktopView}>
            {updates.map((item, index) => (
              <div key={item.id} className={styles.timelineItemUpdate}>
                <div className={styles.fullWidthCard}>
                  <UpdateCard
                    item={item}
                    index={index}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onPublish={handlePublishToggle}
                    publishingStates={publishingStates}
                  />
                  
                  {/* Image Management Section */}
                  <div className={styles.imageManagerToggle}>
                    <ImageButton 
                      onClick={() => toggleImageManager(item.id)}
                      size="small"
                    >
                      {expandedUpdateId === item.id ? "Hide Images" : "Manage Images"}
                    </ImageButton>
                  </div>
                  
                  {expandedUpdateId === item.id && (
                    <UpdateImageManager updateId={item.id} wardId={wardId} />
                  )}

                  <CompactImageContainer
                    updateId={item.id}
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