"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

export default function CodeDetailsCard({ code }) {
  if (!code) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{code.display_name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Badge>Level {code.level}</Badge>

          <Badge variant="outline">{code.dimension_name}</Badge>

          {code.is_leaf ? (
            <Badge>Leaf</Badge>
          ) : (
            <Badge variant="secondary">Parent</Badge>
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7">
          {code.description}
        </p>
      </CardContent>
    </Card>
  );
}
