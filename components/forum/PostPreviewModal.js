import React from 'react';
import RenderEditorBlock from '../shared/RenderEditorBlock';
import styles from '../../styles/forum/review-post.module.css';

const PostPreviewModal = ({ 
  post,
  onClose,
  onSubmit,
  submitLabel = "Submit",
  isSubmitting = false,
  showActions = true,
  children
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button 
          onClick={onClose}
          className={styles.closeButton}
        >
          &times;
        </button>
        
        <h2>{post.title}</h2>
        
        <div className={styles.postContent}>
          {post.description && <p className={styles.postDescription}>{post.description}</p>}
          
          {post.content?.blocks?.map((block, i) => (
            <RenderEditorBlock
              key={i}
              block={block}
              index={i}
            />
          ))}
        </div>

        {showActions && onSubmit && (
          <div className={styles.modalActions}>
            <div className={styles.submitActions}>
              <button
                onClick={onClose}
                className={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : submitLabel}
              </button>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default PostPreviewModal;