import { Card } from "@/components/ui/card";

export default function CreatePostSkeleton() {
  return (
    <Card className="w-full animate-pulse space-y-4 p-4">
      {/* Category select */}
      <div className="h-10 w-40 rounded-md bg-muted" />

      {/* Editor area */}
      <div className="h-36 w-full rounded-md bg-muted" />

      {/* Attachment row */}
      <div className="h-8 w-32 rounded-md bg-muted" />

      {/* Button */}
      <div className="h-9 w-20 rounded-md bg-muted" />
    </Card>
  );
}
