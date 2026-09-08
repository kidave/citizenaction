import Link from "next/link";
import { ArrowRight, FileCheck2, Gavel, Users } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";

import BackButton from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useAdminDashboard(!!user?.id);

  if (authLoading || isLoading) {
    return <main className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading administration...</main>;
  }

  if (!user) {
    return <main className="mx-auto min-h-dvh max-w-4xl px-4 py-10 text-sm text-muted-foreground">Administrator access required.</main>;
  }

  if (error) {
    return <main className="mx-auto min-h-dvh max-w-4xl px-4 py-10"><Card><CardContent className="py-10 text-center"><p className="font-medium">Unable to load administration.</p><p className="mt-1 text-sm text-muted-foreground">Please try again.</p></CardContent></Card></main>;
  }

  const cards = [
    {
      title: "Users",
      description: "Manage registered users and platform roles.",
      value: data?.userCount || 0,
      href: "/admin/user",
      icon: Users,
      label: "Manage users",
    },
    {
      title: "Spaces",
      description: "Review applications for new Spaces.",
      value: data?.pendingSpaceApplications || 0,
      href: "/admin/space",
      icon: FileCheck2,
      label: "Manage Spaces",
      badge: "pending",
    },
    {
      title: "Governance",
      description: "Review proposed changes to the governance model.",
      value: data?.pendingGovernanceChanges || 0,
      href: "/admin/governance",
      icon: Gavel,
      label: "Review governance",
      badge: "pending",
    },
  ];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Administration</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage Citizen Action at the platform level.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ title, description, value, href, icon: Icon, label, badge }) => (
          <Card key={href} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50"><Icon className="h-5 w-5" /></div>
                {badge && <Badge variant={value > 0 ? "destructive" : "secondary"}>{value} {badge}</Badge>}
              </div>
              <CardTitle className="mt-2">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              {!badge && <div className="mb-4 text-3xl font-semibold">{value}</div>}
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={href}>{label}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
