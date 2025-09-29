// hooks/useAuthAlert.js
import { createContext, useContext, useState, useCallback } from 'react';
import AuthAlert from 'components/shared/alert/AuthAlert';

const AuthAlertContext = createContext();

export function AuthAlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "Authentication Required",
    message: "Please log in to access this feature",
  });

  const showAuthAlert = useCallback((title, message) => {
    setAlertState({
      isOpen: true,
      title: title || "Authentication Required",
      message: message || "Please log in to access this feature",
    });
  }, []);

  const hideAuthAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const AuthAlertComponent = () => (
    <AuthAlert
      isOpen={alertState.isOpen}
      onClose={hideAuthAlert}
      title={alertState.title}
      message={alertState.message}
    />
  );

  return (
    <AuthAlertContext.Provider value={{ showAuthAlert }}>
      {children}
      <AuthAlertComponent />
    </AuthAlertContext.Provider>
  );
}

export function useAuthAlert() {
  const context = useContext(AuthAlertContext);
  if (!context) {
    throw new Error('useAuthAlert must be used within an AuthAlertProvider');
  }
  return context;
}