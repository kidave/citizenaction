import { Spinner } from "@/components/ui/spinner";

export default function LoadingState({ label = "Loading...", className = "" }) {
  return (
    <div
      className={`flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground ${className}`}
      role="status"
      aria-label={label}
    >
      <Spinner className="size-5" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
