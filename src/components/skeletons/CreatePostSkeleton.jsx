import { Card } from "@/components/ui/card";

export default function CreatePostSkeleton() {
  return (
    <Card className="w-full p-4 space-y-4 animate-pulse">

      {/* Category select */}
      <div className="h-10 w-40 bg-muted rounded-md" />

      {/* Editor area */}
      <div className="h-36 w-full bg-muted rounded-md" />

      {/* Attachment row */}
      <div className="h-8 w-32 bg-muted rounded-md" />

      {/* Button */}
      <div className="h-9 w-20 bg-muted rounded-md" />

    </Card>
  );
}
