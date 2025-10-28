// components/shared/GlobalAlert.js
import { useAlert } from "context/AlertContext";
import AuthAlert from "components/shared/alert/AuthAlert";
import ConfirmAlert from "components/shared/alert/ConfirmAlert";
import SuccessAlert from "components/shared/alert/SuccessAlert";
import ErrorAlert from "components/shared/alert/ErrorAlert";
import WarningAlert from "components/shared/alert/WarningAlert";
import InfoAlert from "components/shared/alert/InfoAlert";
import ValidationAlert from "components/shared/alert/ValidationAlert";
import LoadingAlert from "components/shared/alert/LoadingAlert";
import CustomAlert from "components/shared/alert/CustomAlert";

export default function GlobalAlert() {
  const { alertState, hideAlert } = useAlert();
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
}