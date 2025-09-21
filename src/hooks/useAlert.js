// hooks/useAlert.js
import { useState, useCallback } from "react";
import AuthAlert from "components/shared/alert/AuthAlert";
import ConfirmAlert from "components/shared/alert/ConfirmAlert";
import SuccessAlert from "components/shared/alert/SuccessAlert";
import ErrorAlert from "components/shared/alert/ErrorAlert";
import WarningAlert from "components/shared/alert/WarningAlert";
import InfoAlert from "components/shared/alert/InfoAlert";
import ValidationAlert from "components/shared/alert/ValidationAlert";
import LoadingAlert from "components/shared/alert/LoadingAlert";
import CustomAlert from "components/shared/alert/CustomAlert";

export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: null,
    props: {}
  });

  const hideAlert = useCallback(() => {
    setAlertState({ isOpen: false, type: null, props: {} });
  }, []);

  const showAlert = useCallback((type, props = {}) => {
    setAlertState({ isOpen: true, type, props });
  }, []);

  // Quick access methods for each alert type
  const showAuthAlert = useCallback((props = {}) => {
    showAlert('auth', props);
  }, [showAlert]);

  const showConfirmAlert = useCallback((props = {}) => {
    showAlert('confirm', props);
  }, [showAlert]);

  const showSuccessAlert = useCallback((props = {}) => {
    showAlert('success', props);
  }, [showAlert]);

  const showErrorAlert = useCallback((props = {}) => {
    showAlert('error', props);
  }, [showAlert]);

  const showWarningAlert = useCallback((props = {}) => {
    showAlert('warning', props);
  }, [showAlert]);

  const showInfoAlert = useCallback((props = {}) => {
    showAlert('info', props);
  }, [showAlert]);

  const showValidationAlert = useCallback((props = {}) => {
    showAlert('validation', props);
  }, [showAlert]);

  const showLoadingAlert = useCallback((props = {}) => {
    showAlert('loading', props);
  }, [showAlert]);

  const showCustomAlert = useCallback((props = {}) => {
    showAlert('custom', props);
  }, [showAlert]);

  // Alert component renderer
  const AlertComponent = useCallback(() => {
    const { isOpen, type, props } = alertState;

    switch (type) {
      case 'auth':
        return <AuthAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      case 'confirm':
        return <ConfirmAlert isOpen={isOpen} onConfirm={props.onConfirm} onCancel={hideAlert} {...props} />;
      case 'success':
        return <SuccessAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      case 'error':
        return <ErrorAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      case 'warning':
        return <WarningAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      case 'info':
        return <InfoAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      case 'validation':
        return <ValidationAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      case 'loading':
        return <LoadingAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      case 'custom':
        return <CustomAlert isOpen={isOpen} onClose={hideAlert} {...props} />;
      default:
        return null;
    }
  }, [alertState, hideAlert]);

  return {
    // State
    isAlertOpen: alertState.isOpen,
    alertType: alertState.type,
    
    // Show methods
    showAlert,
    showAuthAlert,
    showConfirmAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
    showValidationAlert,
    showLoadingAlert,
    showCustomAlert,
    
    // Hide method
    hideAlert,
    
    // Component
    AlertComponent
  };
};