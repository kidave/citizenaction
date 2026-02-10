import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// 🔐 Later you can wrap this with AdminContext
export default function ManageCommunity() {
  const { query } = useRouter();
  const slug = query.community;

  if (!slug) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">

      <div className="flex items-center gap-3">
        <Link
          href={`/community/${slug}`}
          className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
          aria-label="Back to community"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <h1 className="text-2xl font-semibold">
          Manage Community
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">
            Update details, branding, and contact information
          </span>

          <Link href={`/manage/${slug}/settings`}>
            <Button>Edit Settings</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Club Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-muted-foreground text-sm">
            Create and manage clubs for your community
          </span>
        </CardContent>
      </Card>

    </div>
  );
}
