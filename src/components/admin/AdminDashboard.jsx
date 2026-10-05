import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminUserList from "@/components/admin/user/AdminUserList";
import AdminSpaceApplications from "@/components/admin/space/AdminSpaceApplications";
import AdminGeography from "@/components/admin/geography/AdminGeography";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const requestedTab = Array.isArray(router.query.tab) ? router.query.tab[0] : router.query.tab;
  const activeTab = ["users", "spaces", "geography"].includes(requestedTab) ? requestedTab : "users";

  const changeTab = (value) => {
    router.push({ pathname: router.pathname, query: { ...router.query, tab: value } }, undefined, { shallow: true });
  };

  if (loading) {
    return <div className="min-h-dvh"><AdminPageHeader items={[]} /><div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">Loading administration...</div></div>;
  }

  if (!user) {
    return <div className="min-h-dvh"><AdminPageHeader items={[]} /><div className="mx-auto w-full max-w-4xl px-4 py-10 text-sm text-muted-foreground">Administrator access required.</div></div>;
  }

  return (
    <div className="min-h-dvh w-full">
      <AdminPageHeader items={[]} />
      <div className="mx-auto w-full max-w-4xl px-2 pb-2 sm:px-4 sm:pb-4">
        <Tabs value={activeTab} onValueChange={changeTab} className="min-w-0">
          <TabsList className="w-max max-w-full">
            <TabsTrigger value="users" className="px-3 sm:px-4">
              Users
            </TabsTrigger>
            <TabsTrigger value="spaces" className="px-3 sm:px-4">
              Spaces
            </TabsTrigger>
            <TabsTrigger value="geography" className="px-3 sm:px-4">
              Geography
            </TabsTrigger>
          </TabsList>

          <main className="pt-4">
            <TabsContent value="users">
              <AdminUserList embedded />
            </TabsContent>
            <TabsContent value="spaces">
              <AdminSpaceApplications embedded />
            </TabsContent>
            <TabsContent value="geography">
              <AdminGeography embedded />
            </TabsContent>
          </main>
        </Tabs>
      </div>
    </div>
  );
}
