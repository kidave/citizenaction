import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ClassificationDimensionSidebar({
  dimensions,
  selected,
  onSelect,
}) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-3">
        {dimensions.map((dimension) => (
          <button
            key={dimension.id}
            onClick={() => onSelect(dimension)}
            className={cn(
              "w-full rounded-md px-3 py-2 text-left transition-colors",
              selected?.id === dimension.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            {dimension.name}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
