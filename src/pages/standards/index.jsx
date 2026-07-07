import { useRouter } from "next/router";

import useClassificationSystems from "@/hooks/standards/useClassificationSystems";

import {
  ClassificationSystemCard,
  ClassificationSkeleton,
} from "@/components/standards";

import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

export default function StandardsPage() {
  const router = useRouter();

  const { data = [], isLoading } = useClassificationSystems();

  if (isLoading) {
    return <ClassificationSkeleton />;
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Standards</h1>

          <p className="text-muted-foreground">
            Classification systems used across Urban.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Import Standard
        </Button>
      </div>

      <div className="grid gap-5">
        {data.map((system) => (
          <ClassificationSystemCard key={system.id} system={system} />
        ))}
      </div>
    </div>
  );
}
