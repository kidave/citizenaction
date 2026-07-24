import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import EditorModal from "@/components/feed/editor/EditorModal";

export default function ActionPage() {
  const router = useRouter();

  const { user, loading } = useRequireAuth();

  function handleClose() {
    const returnTo = localStorage.getItem("returnTo");

    if (returnTo) {
      localStorage.removeItem("returnTo");
      router.replace(returnTo);
      return;
    }

    router.replace("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <EditorModal isOpen onClose={handleClose} />;
}
