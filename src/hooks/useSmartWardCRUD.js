// hooks/useSmartCRUD.js - BUILDING ON YOUR EXISTING HOOKS
import { useCallback } from 'react';
import { useAlert } from './useAlert';
import useWardCRUD from './useWardCRUD';

export const useSmartWardCRUD = (resourceType, wardId, options = {}) => {
  const { showConfirmAlert, showSuccessAlert, showErrorAlert } = useAlert();
  const { create, update, remove } = useWardCRUD(resourceType, wardId);
  
  const { 
    onSuccess, 
    onError, 
    customMessages = {},
    requireRefresh = true 
  } = options;

  // Auto-generated messages based on resource type
  const messages = {
    create: customMessages.create || `${resourceType} created successfully!`,
    update: customMessages.update || `${resourceType} updated successfully!`, 
    delete: customMessages.delete || `${resourceType} deleted successfully!`,
    publish: customMessages.publish || `${resourceType} published successfully!`,
    unpublish: customMessages.unpublish || `${resourceType} unpublished successfully!`,
    error: customMessages.error || `Failed to ${resourceType.toLowerCase()} operation`
  };

  // Smart delete with auto-confirmation
  const smartDelete = useCallback((id, customMessage) => {
    showConfirmAlert({
      title: `Delete ${resourceType}`,
      message: customMessage || `Are you sure you want to delete this ${resourceType.toLowerCase()}?`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await remove(id);
          showSuccessAlert({ message: messages.delete });
          onSuccess?.();
        } catch (err) {
          showErrorAlert({ message: messages.error, errorDetails: err.message });
          onError?.(err);
        }
      }
    });
  }, [remove, showConfirmAlert, showSuccessAlert, showErrorAlert, messages]);

  // Smart create with auto-success
  const smartCreate = useCallback(async (data) => {
    try {
      const result = await create(data);
      showSuccessAlert({ message: messages.create });
      onSuccess?.();
      return result;
    } catch (err) {
      showErrorAlert({ message: messages.error, errorDetails: err.message });
      onError?.(err);
      throw err;
    }
  }, [create, showSuccessAlert, showErrorAlert, messages]);

  // Smart update with auto-success  
  const smartUpdate = useCallback(async (id, data) => {
    try {
      const result = await update(id, data);
      showSuccessAlert({ message: messages.update });
      onSuccess?.();
      return result;
    } catch (err) {
      showErrorAlert({ message: messages.error, errorDetails: err.message });
      onError?.(err);
      throw err;
    }
  }, [update, showSuccessAlert, showErrorAlert, messages]);

  // Smart publish/unpublish
  const smartPublish = useCallback(async (id, publishState) => {
    try {
      await update(id, { is_published: publishState });
      showSuccessAlert({ 
        message: publishState ? messages.publish : messages.unpublish 
      });
      onSuccess?.();
    } catch (err) {
      showErrorAlert({ 
        message: messages.error, 
        errorDetails: err.message 
      });
      onError?.(err);
    }
  }, [update, showSuccessAlert, showErrorAlert, messages]);

  return {
    // Smart operations with built-in alerts
    create: smartCreate,
    update: smartUpdate, 
    delete: smartDelete,
    publish: smartPublish,
    
    // Original operations (if needed)
    raw: { create, update, remove }
  };
};