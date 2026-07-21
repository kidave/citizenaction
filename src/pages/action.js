// pages/action.js

import { useRequireAuth } from "@/hooks/useRequireAuth";
import EditorModal from "@/components/feed/editor/EditorModal";

export default function ActionPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="flex justify-center py-10">
      <EditorModal isOpen={true} onClose={() => window.history.back()} />
    </div>
  );
}
