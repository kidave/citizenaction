import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = Inbox,
  className = "",
}) {
  return (
    <div className={`flex min-h-[30vh] items-center justify-center text-center ${className}`}>
      <div className="max-w-sm">
        <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
