"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function MetricCard({
  icon: Icon,
  label,
  value,
  className = "",
}) {
  return (
    <Card
      className={`rounded-[28px] bg-gradient-to-br from-background to-muted/40 transition ${className} `}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {label}
            </div>

            <div className="mt-2 text-4xl font-black leading-none">{value}</div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
