// pages/admin/[wardId]/[tab].js
import { useRouter } from "next/router";
import Spinner from "components/shared/ui/Spinner";
import { AdminProvider, useAdmin } from "context/AdminContext";
import { WardProvider } from "context/WardContext";
import AdminLayout from "components/admin/AdminLayout";

function AdminPageContent({ wardId, tab }) {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  if (loading) return <Spinner mode="fullscreen" />;

  if (!isAdmin) {
    router.replace(`/ward/${wardId}/${tab || "meeting"}`);
    return null;
  }

  return <AdminLayout wardId={wardId} activeTab={tab} />;
}

export default function AdminPage() {
  const router = useRouter();
  const { wardId, tab } = router.query;

  if (!wardId) return <Spinner mode="fullscreen" />;

  return (
    <WardProvider wardId={wardId}>
      <AdminProvider wardId={wardId}>
        <AdminPageContent wardId={wardId} tab={tab} />
      </AdminProvider>
    </WardProvider>
  );
}