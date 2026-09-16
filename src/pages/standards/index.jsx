import useClassificationSystems from "@/hooks/standards/useClassificationSystems";

import {
  ClassificationSystemCard,
  ClassificationSkeleton,
} from "@/components/standards";

import Topbar from "@/components/navigation/Topbar";
import { Plus } from "lucide-react";

export default function StandardsPage() {
  const { data = [], isLoading } = useClassificationSystems();

  if (isLoading) {
    return <ClassificationSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Topbar
        items={[
          { label: "Home", href: "/" },
          { label: "Standards" },
        ]}
        title="Standards"
        primaryActions={[
          {
            label: "Import Standard",
            icon: Plus,
          },
        ]}
        backHref="/"
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
