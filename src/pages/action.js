import { useRouter } from "next/router";

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
    return null;
  }

  if (!user) return null;

  return <EditorModal mode="post" isOpen onClose={handleClose} />;
}
