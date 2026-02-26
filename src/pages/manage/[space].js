import { useRouter } from "next/router";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// 🔐 Later you can wrap this with AdminContext
export default function ManageSpace() {
  const { query } = useRouter();
  const slug = query.space;

  if (!slug) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">

      <div className="flex items-center gap-3">
        <Link
          href={`/space/${slug}`}
          className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
          aria-label="Back to space"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <h1 className="text-2xl font-semibold">
          Manage Space
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Space Settings</CardTitle>
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
            Create and manage clubs for your space
          </span>
        </CardContent>
      </Card>

    </div>
  );
}
