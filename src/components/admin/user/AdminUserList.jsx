import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useAdminUsers, useSetPlatformUserRole } from "@/hooks/admin/useAdminUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function initials(name) {
  return name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
}

export default function AdminUserList() {
  const { data: users = [], isLoading, error } = useAdminUsers();
  const { mutateAsync: setRole, isPending } = useSetPlatformUserRole();
  const [savingUserId, setSavingUserId] = useState(null);

  async function changeRole(userId, role) {
    setSavingUserId(userId);
    try {
      await setRole({ userId, role });
      toast.success(role === "admin" ? "User promoted to administrator" : "Administrator role removed");
    } catch (err) {
      toast.error(err?.message || "Unable to change user role");
    } finally {
      setSavingUserId(null);
    }
  }

  if (isLoading) return <main className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading users...</main>;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Button variant="ghost" asChild className="mb-4 -ml-3"><Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Administration</Link></Button>
      <div className="mb-6"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1><p className="mt-1 text-sm text-muted-foreground">Manage registered users and platform administrator roles.</p></div>

      {error ? <Card><CardContent className="py-10 text-center text-sm text-destructive">Unable to load users.</CardContent></Card> : (
        <Card>
          <CardHeader><CardTitle>Registered users</CardTitle><CardDescription>{users.length} users</CardDescription></CardHeader>
          <CardContent className="p-0"><div className="divide-y">
            {users.map((user) => {
              const busy = isPending && savingUserId === user.user_id;
              return <div key={user.user_id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">{user.avatar_url ? <img src={user.avatar_url} alt={user.name || "User"} className="h-full w-full object-cover" /> : <span className="text-sm font-medium">{initials(user.name)}</span>}</div>
                  <div className="min-w-0"><div className="truncate font-medium">{user.name || "Unnamed user"}</div>{user.username && <div className="truncate text-sm text-muted-foreground">@{user.username}</div>}{user.designation && <div className="truncate text-xs text-muted-foreground">{user.designation}</div>}</div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="gap-1">{user.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}{user.role || "user"}</Badge>
                  <Select value={user.role || "user"} onValueChange={(role) => changeRole(user.user_id, role)} disabled={busy}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="user"><UserRound className="mr-2 inline h-3.5 w-3.5" />User</SelectItem><SelectItem value="admin"><ShieldCheck className="mr-2 inline h-3.5 w-3.5" />Admin</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>;
            })}
          </div></CardContent>
        </Card>
      )}
    </main>
  );
}
