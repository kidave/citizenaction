import useClassificationSystems from "@/hooks/standards/useClassificationSystems";

import {
  ClassificationSystemCard,
  ClassificationSkeleton,
} from "@/components/standards";

import PageHeader from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

export default function StandardsPage() {
  const { data = [], isLoading } = useClassificationSystems();

  if (isLoading) {
    return <ClassificationSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        items={[
          { label: "Home", href: "/" },
          { label: "Standards" },
        ]}
        title="Standards"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Import Standard
          </Button>
        }
      />

      <main className="p-4">
        <div className="mb-8">
          <p className="text-muted-foreground">
            Classification systems used across Urban.
          </p>
        </div>

        <div className="grid gap-5">
          {data.map((system) => (
            <ClassificationSystemCard key={system.id} system={system} />
          ))}
        </div>
      </main>
    </div>
  );
}
