"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Zap,
  FileText,
  RefreshCw,
  Calendar,
  Users,
} from "lucide-react";

const TYPES = [
  { value: "action", label: "Action", icon: Zap },
  { value: "report", label: "Report", icon: FileText },
  { value: "update", label: "Update", icon: RefreshCw },
  { value: "event", label: "Event", icon: Calendar },
  { value: "meeting", label: "Meeting", icon: Users },
];

export default function PostTypeSelector({ type, setType }) {
  const selected = TYPES.find((t) => t.value === type);
  const SelectedIcon = selected?.icon;

  return (
    <div className="flex-shrink-0">

      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[140px] flex items-center gap-2">

          {/* Selected value with icon */}

          <SelectValue placeholder="Type" />

        </SelectTrigger>

        <SelectContent>
          {TYPES.map((t) => {
            const Icon = t.icon;

            return (
              <SelectItem key={t.value} value={t.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {t.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

    </div>
  );
}