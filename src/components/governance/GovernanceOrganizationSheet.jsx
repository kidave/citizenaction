"use client";

import { useEffect, useId, useState } from "react";
import { Building2, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isValidGovernanceImageUrl, GOVERNANCE_IMAGE_URL_HELPER_TEXT } from "@/utils/governanceImageUrl";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { moveGovernanceFile } from "@/lib/supabase/storage";
import { useImportGovernanceOrganizationImage } from "@/hooks/governance/useImportGovernanceOrganizationImage";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import {
  GOVERNANCE_STATUS_OPTIONS,
  GOVERNANCE_TYPES,
  GOVERNANCE_DOMAINS,
  formatGovernanceType,
  governanceRequiresValidTo,
} from "@/utils/governance";

function emptyForm(record, defaultDomain = "unassigned") {
  const metadata = record?.metadata || {};
  return {
    name: record?.name || "",
    shortName: record?.short_name || "",
    description: record?.description || "",
    website: record?.website || "",
    type: record?.type || "organizat¶»§q«^