import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ManageClub() {
  const { query } = useRouter();
  const slug = query.space;
  const { scopeType, scopeCode } = query;

  if (!slug) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-10">
      <div className="flex items-center gap-3">
        <Link
          href={`/space/${slug}/${scopeType}/${scopeCode}`}
          className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
          aria-label="Back to space"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <h1 className="text-2xl font-semibold">Manage Club</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Update details, branding, and contact information
          </span>

          <Link href={`/manage/${slug}/${scopeType}/${scopeCode}/settings`}>
            <Button>Edit Settings</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-sm text-muted-foreground">
            Manage your club members, roles, and permissions
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
