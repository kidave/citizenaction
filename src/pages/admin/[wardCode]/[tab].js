// pages/admin/[wardCode]/[tab].js
import { useRouter } from "next/router";
import Spinner from "components/shared/ui/Spinner";
import { AdminProvider, useAdmin } from "context/AdminContext";
import { WardProvider } from "context/WardContext";
import AdminLayout from "components/admin/AdminLayout";

function AdminPageContent({ wardCode, tab }) {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  if (loading) return <Spinner mode="fullscreen" />;

  if (!isAdmin) {
    router.replace(`/ward/${wardCode}/${tab || "meeting"}`);
    return null;
  }

  return <AdminLayout wardCode={wardCode} activeTab={tab} />;
}

export default function AdminPage() {
  const router = useRouter();
  const { wardCode, tab } = router.query;

  if (!wardCode) return <Spinner mode="fullscreen" />;

  return (
    <WardProvider wardCode={wardCode}>
      <AdminProvider wardCode={wardCode}>
        <AdminPageContent wardCode={wardCode} tab={tab} />
      </AdminProvider>
    </WardProvider>
  );
}