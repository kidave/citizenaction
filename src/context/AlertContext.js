// context/AlertContext.js
import { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
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

  // Your existing alert methods
  const showSuccessAlert = useCallback((props = {}) => {
    showAlert('success', props);
  }, [showAlert]);

  const showErrorAlert = useCallback((props = {}) => {
    showAlert('error', props);
  }, [showAlert]);

  const showConfirmAlert = useCallback((props = {}) => {
    showAlert('confirm', props);
  }, [showAlert]);

  const showWarningAlert = useCallback((props = {}) => {
    showAlert('warning', props);
  }, [showAlert]);

  const showLoadingAlert = useCallback((props = {}) => {
    showAlert('loading', props);
  }, [showAlert]);

  const showValidationAlert = useCallback((props = {}) => {
    showAlert('validation', props);
  }, [showAlert]);

  const showInfoAlert = useCallback((props = {}) => {
    showAlert('info', props);
  }, [showAlert]);

  const showAuthAlert = useCallback((props = {}) => {
    showAlert('auth', props);
  }, [showAlert]);


  const value = {
    // State
    isAlertOpen: alertState.isOpen,
    alertType: alertState.type,
    
    // Show methods
    showAlert,
    showSuccessAlert,
    showErrorAlert,
    showConfirmAlert,
    showWarningAlert,
    showLoadingAlert,
    showValidationAlert,
    showInfoAlert,
    showAuthAlert,
    
    
    // Hide method
    hideAlert,
    
    // Alert state for component
    alertState
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};