// hooks/useAuthAlert.js
import { useState, useCallback } from "react";
import AuthAlert from "components/shared/ui/AuthAlert";

export const useAuthAlert = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showAuthAlert = useCallback(() => {
    setIsOpen(true);
  }, []);

  const hideAuthAlert = useCallback(() => {
    setIsOpen(false);
  }, []);

  const AuthAlertComponent = useCallback(() => (
    <AuthAlert
      isOpen={isOpen}
      onClose={hideAuthAlert}
    />
  ), [isOpen, hideAuthAlert]);

  return {
    showAuthAlert,
    hideAuthAlert,
    AuthAlertComponent,
    isAuthAlertOpen: isOpen
  };
};