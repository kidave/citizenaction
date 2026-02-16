// pages/action.js

import { useRequireAuth } from "@/hooks/useRequireAuth";
import CreatePostModal from "@/components/feed/CreatePostModal";

export default function ActionPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="flex justify-center py-10">
      <CreatePostModal
        isOpen={true}
        onClose={() => window.history.back()}
      />
    </div>
  );
}
