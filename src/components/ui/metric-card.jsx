"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function MetricCard({
  icon: Icon,
  label,
  value,
  className = "",
}) {
  return (
    <Card className={`rounded-3xl bg-muted ${className}`}>
      <CardContent className="space-y-4 p-5">
        {/* Label */}
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        {/* Value + Icon */}
        <div className="flex items-center justify-between">
          <span className="text-4xl font-semibold leading-none tracking-tight">
            {value}
          </span>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-background">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
