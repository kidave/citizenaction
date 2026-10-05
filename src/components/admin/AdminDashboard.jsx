import Link from "next/link";
import { ArrowRight, FileCheck2, MapPinned, Users } from "lucide-react";
import { useRouter } from "next/router";

import { useAuth } from "@/context/AuthContext";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import AdminSettingsShell from "@/components/layout/AdminSettingsShell";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useAdminDashboard(!!user?.id);

  if (authLoading || isLoading) return <main className="min-h-dvh w-full"><AdminPageHeader items={[]} /><div className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">Loading administration...</div></main>;
  if (!user) return <main className="min-h-dvh text-sm text-muted-foreground"><AdminPageHeader items={[]} /><div className="mx-auto w-full max-w-4xl px-4 py-10">Administrator access required.</div></main>;
  if (error) return <main className="min-h-dvh"><AdminPageHeader items={[]} /><div className="mx-auto w-full max-w-4xl px-4 py-10"><Card><CardContent className="py-10 text-center"><p className="font-medium">Unable to load administration.</p><p className="mt-1 text-sm text-muted-foreground">Please try again.</p></CardContent></Card></div></main>;

  const tabs = [
    { value: "users", label: "Users" },
    { value: "spaces", label: "Spaces" },
    { value: "geography", label: "Geography" },
  ];
  const requestedTab = Array.isArray(router.query.tab) ? router.query.tab[0] : router.query.tab;
  const activeTab = tabs.some((tab) => tab.value === requestedTab) ? requestedTab : "users";

  const cards = {
    users: { title: "Users", description: "Manage registered users and platform roles.", value: data?.userCount || 0, href: "/admin/user", icon: Users, label: "Manage users" },
    spaces: { title: "Spaces", description: "Review applications for new Spaces.", value: data?.pendingSpaceApplications || 0, href: "/admin/space", icon: FileCheck2, label: "Manage Spaces", badge: "pending" },
    geography: { title: "Geography", description: "Manage geography and its boundaries.", value: null, href: "/admin/geography", icon: MapPinned, label: "Manage geography" },
  };

  const item = cards[activeTab];
  const Icon = item.icon;

  return (
    <div className="min-h-dvh w-full">
      <AdminPageHeader items={[]} />
      <AdminSettingsShell title="Administration" description="Manage Citizen Action at the platform level." tabs={tabs}>
        <Card className="max-w-xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50"><Icon className="h-5 w-5" /></div>
              {item.badge ? <Badge variant={item.value > 0 ? "destructive" : "secondary"}>{item.value} {item.badge}</Badge> : null}
            </div>
            <CardTitle className="mt-2">{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent><Button asChild variant="outline" className="w-full justify-between"><Link href={item.href}>{item.label}<ArrowRight className="h-4 w-4" /></Link></Button></CardContent>
        </Card>
      </AdminSettingsShell>
    </div>
  );
}
