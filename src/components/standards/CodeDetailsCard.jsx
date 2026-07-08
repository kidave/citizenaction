"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CopyField from "@/components/ui/CopyField";

export default function CodeDetailsCard({ code }) {
  if (!code) return null;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-xl">
            {code.display_name || code.title}
          </CardTitle>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>Level {code.level}</Badge>

          <Badge variant="outline">{code.dimension_name}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4">
          <h4 className="mb-3 text-sm font-semibold">Description</h4>

          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {code.description || "No description available."}
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Details</h4>

          <div className="grid gap-3 sm:grid-cols-2">
            <CopyField label="Title" value={code.title} />

            <CopyField label="Code" value={code.code} />

            <CopyField label="Path" value={code.path} />

            <CopyField label="Parent" value={code.parent_title} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Color</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div
                className="h-16 rounded-lg border"
                style={{
                  background: code.color_hex || code.color || "#e5e7eb",
                }}
              />

              <div className="space-y-2">
                <CopyField label="Name" value={code.color} />

                <CopyField label="Hex" value={code.color_hex} />

                <CopyField label="RGB" value={code.color_rgb} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Icon</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-3xl">
                {code.symbol || "⬜"}
              </div>

              <div className="space-y-2">
                <CopyField label="Symbol" value={code.symbol} />

                <CopyField label="Icon" value={code.icon} />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-medium">{value || "—"}</div>
    </div>
  );
}
