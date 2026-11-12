import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ClassificationSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        className="pl-9"
      />
    </div>
  );
}
