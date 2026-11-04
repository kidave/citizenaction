import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GitBranch, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ImageUpload from "@/components/ui/ImageUpload";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import {
  GOVERNANCE_TYPES,
  GOVERNANCE_STATUS_OPTIONS,
  formatGovernanceType,
  getGovernanceLabel,
} from "@/utils/governance";
import { supabase } from "@/lib/supabase/client";

function EntityAvatar({ entity, size = "h-9 w-9" }) {
  const label = getGovernanceLabel(entity);
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Avatar className={`${size} shrink-0 rounded-md`}>
      <AvatarImage src={entity?.image_url || undefined} alt={label} />
      <AvatarFallback className="rounded-md text-[11px]">{initials}</AvatarFallback>
    </Avatar>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-f¶»§q«^