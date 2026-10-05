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
      <Tabs value={activeTab} onValueChange={changeTab} className="w-full">
        <div className="border-b bg-background">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="overflow-x-auto">
              <TabsList className="h-10 w-max min-w-full justify-start rounded-none bg-transparent p-0">
                <TabsTrigger value="users" className="mr-6 h-10 rounded-none border-b-2 border-transparent bg-transparent px-1 shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">Users</TabsTrigger>
                <TabsTrigger value="spaces" className="mr-6 h-10 rounded-none border-b-2 border-transparent bg-transparent px-1 shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">Spaces</TabsTrigger>
                <TabsTrigger value="geography" className="mr-6 h-10 rounded-none border-b-2 border-transparent bg-transparent px-1 shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">Geography</TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <TabsContent value="users"><AdminUserList embedded /></TabsContent>
          <TabsContent value="spaces"><AdminSpaceApplications embedded /></TabsContent>
          <TabsContent value="geography"><AdminGeography embedded /></TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
