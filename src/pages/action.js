// pages/action.js

import { useRequireAuth } from "@/hooks/useRequireAuth";
import PostEditorModal from "@/components/feed/post-editor/PostEditorModal";

export default function ActionPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="flex justify-center py-10">
      <PostEditorModal isOpen={true} onClose={() => window.history.back()} />
    </div>
  );
}
