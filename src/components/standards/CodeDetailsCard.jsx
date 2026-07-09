"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CopyField from "@/components/ui/CopyField";

export default function CodeDetailsCard({ code }) {
  if (!code) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="text-xl font-bold">{code.display_name || code.title}</div>

      <div className="space-y-6">
        <h4>{code.description || "No description available."}</h4>

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
      </div>
    </div>
  );
}
