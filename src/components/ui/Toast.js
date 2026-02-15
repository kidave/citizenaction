import { Toaster, toast } from "sonner";

export { toast };

export function ToastProvider() {
  return <Toaster position="top-center" richColors />;
}
