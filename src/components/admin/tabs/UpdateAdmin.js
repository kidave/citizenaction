// components/admin/UpdateAdmin.js
import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useAuth } from "context/AuthContext";
import useAdminUpdates from "hooks/useAdminUpdates";
import useWardCRUD from "hooks/useWardCRUD";
import UpdateCard from "components/shared/UpdateCard";
import UpdateForm from "components/shared/UpdateForm";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/timeline.module.css";
import { FaPlus } from "react-icons/fa";

export default function UpdateAdmin() {
  const { wardId } = useWard();
  const { getAccessToken } = useAuth();
  const { updates, loading, error, setUpdates } = useAdminUpdates(wardId);
  const { create, update, remove } = useWardCRUD("update", wardId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
      console.error("Failed to refresh updates:", err);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      setShowAddForm(false);
      refreshUpdates();
    } catch (err) {
      console.error("Failed to create update:", err);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await update(id, formData);
      setEditingId(null);
      refreshUpdates();
    } catch (err) {
      console.error("Failed to update update:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this update?")) {
      try {
        await remove(id);
        refreshUpdates();
      } catch (err) {
        console.error("Failed to delete update:", err);
      }
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div>Error loading updates: {error}</div>;

  return (
    <>
      {/* Add update button */}
      <div className={styles.addButtonContainer}>
        <motion.button 
          className={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        > 
          <FaPlus className={styles.addButtonIconFa} />
          <div className={styles.addButtonText}>Add Update</div>
        </motion.button>
      </div>

      {/* Add update form */}
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

      {/* Timeline View */}
      <div className={styles.timelineWrapper}>
        {updates.length === 0 ? (
          <p className={styles.emptyTimeline}>No updates yet.</p>
        ) : (
          <div className={styles.desktopView}>
            {updates.map((item, index) => (
              <div key={item.id} className={styles.timelineItemUpdate}>
                <div
                  className={styles.centeredDate}
                  style={{ cursor: "auto" }} // Remove pointer cursor since we're not toggling
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}