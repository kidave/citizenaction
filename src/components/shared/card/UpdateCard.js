// components/shared/card/UpdateCard.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from 'components/shared/card/StatusBadge';
import { EditButton, DeleteButton, SaveButton, CancelButton, PublishButton } from "components/shared/ui/Buttons";
import styles from "styles/tabs/timeline.module.css";
import ButtonGroup from "components/shared/ui/ButtonGroup";

export default function UpdateCard({ 
  item, 
  index, 
  editable = false, 
  onUpdate, 
  onDelete,
  onPublish,
  publishingStates = {},
  isNew = false,
  deleting = false
}) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isActive, setIsActive] = useState(index === 0);
  const [form, setForm] = useState({
    date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    operation: item.operation || "",
    description: item.description || "",
    support: item.support || "",
    is_published: item.is_published || false
  });

  const handleSave = async () => {
    try {
      await onUpdate(item.id, form);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save update:", error);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      onDelete();
    } else {
      setIsEditing(false);
      setForm({
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        operation: item.operation || "",
        description: item.description || "",
        support: item.support || "",
        is_published: item.is_published || false
      });
    }
  };

  const handleDelete = () => {
    // Directly call onDelete - confirmation is handled in parent
    onDelete(item.id);
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish(item.id, !item.is_published);
    }
  };

  const renderDiscussion = (label, content) => {
    if (!content) return null;
    const points = Array.isArray(content) ? content : content.split("\n").filter((s) => s.trim());
    
    return (
      <div className={styles.operationSection}>
        <h5 className={styles.sectionTitle}>{label}</h5>
        <ul className={styles.discussionList}>
          {points.map((pt, i) => (
            <li key={i} className={styles.discussionPoint}>{pt}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className={styles.formContainer}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Date:</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Key Operations:</label>
            <textarea
              value={form.operation}
              onChange={(e) => setForm({ ...form, operation: e.target.value })}
              placeholder="Key Operations (one per line)"
              rows="3"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description:</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (one per line)"
              rows="3"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Support Needed:</label>
            <textarea
              value={form.support}
              onChange={(e) => setForm({ ...form, support: e.target.value })}
              placeholder="Support Needed (one per line)"
              rows="3"
            />
          </div>
          
          <ButtonGroup>
            <SaveButton type="submit">
              {isNew ? "Create" : "Save"}
            </SaveButton>
            <CancelButton type="button" onClick={handleCancel}/>
          </ButtonGroup>
        </form>
      </motion.div>
    );
  }

  return (
    <div className={styles.timelineItemUpdate}>
      <div
        className={`${styles.centeredDate} ${isActive ? styles.activeDate : ''}`}
        onClick={() => setIsActive(!isActive)}
        style={{ cursor: "pointer" }}
      >
        {new Date(item.date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </div>

      <div className={styles.fullWidthCard}>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className={`${styles.timelineCard} ${styles.updateCard}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.cardHeaderLeft}>
                    {editable && (
                      <StatusBadge 
                        status={item.is_published ? 'published' : 'draft'}
                        variant="badge"
                        customLabel={item.is_published ? 'Published' : 'Draft'}
                      />
                    )}
                  </div>
                
                  <div className={styles.cardHeaderRight}>
                    {editable && (
                      <ButtonGroup>
                        <PublishButton
                          size="small"
                          published={item.is_published}
                          publishing={publishingStates[item.id]}
                          onClick={handlePublish}
                        />
                        <EditButton 
                          size="small"
                          onClick={() => setIsEditing(true)}
                        />
                        <DeleteButton
                          size="small"
                          onClick={handleDelete}
                          disabled={deleting}
                          loading={deleting}
                        />
                      </ButtonGroup>
                    )}
                  </div>
                </div>  
              </div>
              
              <div className={styles.updateContent}>
                <div className={styles.updateTextContent}>
                  {renderDiscussion("Key Operations", item.operation)}
                  {renderDiscussion("Description", item.description)}
                  {renderDiscussion("Support Needed", item.support)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}