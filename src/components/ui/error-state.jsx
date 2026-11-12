import { AlertCircle } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  className = "",
}) {
  return (
    <div className={`flex min-h-[30vh] items-center justify-center text-center ${className}`}>
      <div className="max-w-sm">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive/70" />
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
