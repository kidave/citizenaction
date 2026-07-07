import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export default function ClassificationSystemCard({ system }) {
  return (
    <Link href={`/standards/${system.code.toLowerCase()}`}>
      <Card className="cursor-pointer transition-colors hover:border-primary">
        <CardContent className="flex items-center justify-between p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{system.name}</h2>

            <p className="text-sm text-muted-foreground">
              {system.description}
            </p>

            <div className="flex gap-2">
              <Badge variant="secondary">
                {system.dimension_count} Dimensions
              </Badge>

              <Badge variant="outline">{system.code_count} Codes</Badge>

              <Badge>{system.version}</Badge>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
