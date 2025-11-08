// components/admin/UpdateAdmin.js
import { useState } from "react";
import { useWard } from "context/WardContext";
import { useAdmin } from "context/AdminContext";
import { useAlert } from "hooks/useAlert";
import useWardCRUD from "hooks/useWardCRUD";
import { useAdminWardUpdates } from "hooks/useWardData";
import UpdateCard from "components/shared/card/UpdateCard";
import { AddButton } from "components/shared/ui/Buttons";
import styles from "styles/tabs/timeline.module.css";

export default function UpdateAdmin() {
  const { wardCode } = useWard();
  const { isAdmin } = useAdmin();
  const { create, update, remove } = useWardCRUD("ward_update", wardCode);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { data: updates, loading, error, refresh } = useAdminWardUpdates(wardCode);
  
  const [newUpdate, setNewUpdate] = useState(null);
  const [publishingStates, setPublishingStates] = useState({});
  const [deletingUpdateId, setDeletingUpdateId] = useState(null);

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      setNewUpdate(null);
      showSuccessAlert({ message: "Monthly update created successfully!" });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to create monthly update", 
        errorDetails: err.message 
      });
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await update(id, formData);
      showSuccessAlert({ message: "Monthly update updated successfully!" });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to update monthly update", 
        errorDetails: err.message 
      });
    }
  };

  const handleDelete = async (id) => {
    setDeletingUpdateId(id);
    showConfirmAlert({
      title: "Delete Update",
      message: "Are you sure you want to delete this Monthly Update?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(id);
          showSuccessAlert({ message: "Monthly update deleted successfully!" });
          await refresh();
        } catch (err) {
          showErrorAlert({ 
            message: "Failed to delete monthly update", 
            errorDetails: err.message 
          });
        } finally {
          setDeletingUpdateId(null);
        }
      },
      onCancel: () => {
        setDeletingUpdateId(null);
      }
    });
  };

  const handlePublish = async (updateId, publishState) => {
    try {
      setPublishingStates(prev => ({ ...prev, [updateId]: true }));
      // Use update function to change is_published status
      await update(updateId, { is_published: publishState });
      showSuccessAlert({ 
        message: `Monthly update ${publishState ? 'published' : 'unpublished'} successfully!` 
      });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: `Failed to ${publishState ? 'publish' : 'unpublish'} monthly update`, 
        errorDetails: err.message 
      });
    } finally {
      setPublishingStates(prev => ({ ...prev, [updateId]: false }));
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.adminPanel}>
        <AlertComponent />
        <div className={styles.errorMessage}>
          You don't have access to manage monthly updates.
        </div>
      </div>
    );
  }

  if (loading) return <div className={styles.loading}>Loading updates...</div>;
  if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

  return (
    <>
      <AlertComponent />

      <div className={styles.addButtonContainer}>
        <AddButton
          variant="outline"
          onClick={() => {
            setNewUpdate({
              id: "new",
              date: new Date().toISOString().split('T')[0],
              operation: "",
              description: "",
              support: "",
              is_published: false
            });
          }}
        >
          Add Update
        </AddButton>
      </div>

      {newUpdate && (
        <UpdateCard
          item={newUpdate}
          index={-1}
          editable={true}
          onUpdate={(id, formData) => {
            handleCreate(formData);
          }}
          onDelete={() => {
            setNewUpdate(null);
          }}
          onPublish={handlePublish}
          publishingStates={publishingStates}
          isNew={true}
          deleting={false}
        />
      )}

      <div>
        {updates && updates.length === 0 && !newUpdate ? (
          <p className={styles.emptyTimeline}>No updates yet.</p>
        ) : (
          <div className={styles.desktopView}>
            {updates?.map((item, index) => (
              <UpdateCard
                key={item.id}
                item={item}
                index={index}
                editable={true}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onPublish={handlePublish}
                publishingStates={publishingStates}
                deleting={deletingUpdateId === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}