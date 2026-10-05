import { useAuth } from "@/context/AuthContext";
import AdminSettingsShell from "@/components/layout/AdminSettingsShell";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminUserList from "@/components/admin/user/AdminUserList";
import AdminSpaceApplications from "@/components/admin/space/AdminSpaceApplications";
import AdminGeography from "@/components/admin/geography/AdminGeography";
import { TabsContent } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-dvh"><AdminPageHeader items={[]} /><div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">Loading administration...</div></div>;
  }

  if (!user) {
    return <div className="min-h-dvh"><AdminPageHeader items={[]} /><div className="mx-auto w-full max-w-4xl px-4 py-10 text-sm text-muted-foreground">Administrator access required.</div></div>;
  }

  return (
    <div className="min-h-dvh w-full">
      <AdminPageHeader items={[]} />
      <AdminSettingsShell
        tabs={[
          { value: "users", label: "Users" },
          { value: "spaces", label: "Spaces" },
          { value: "geography", label: "Geography" },
        ]}
      >
        <TabsContent value="users"><AdminUserList embedded /></TabsContent>
        <TabsContent value="spaces"><AdminSpaceApplications embedded /></TabsContent>
        <TabsContent value="geography"><AdminGeography embedded /></TabsContent>
      </AdminSettingsShell>
    </div>
  );
}
