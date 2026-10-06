"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, MapPin, PanelsTopLeft } from "lucide-react";
import { toast } from "sonner";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";
import LinkManager from "@/components/link/LinkManager";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GovernanceEditorResources({
  governanceId = null,
  entityName = "",
  address,
  lat = null,
  lng = null,
  onAddressChange,
  onLocationChange,
  links = [],
  onLinksChange,
  onFiles,
  geographyId = null,
  onGeographySaved,
  disabled = false,
  onAddressAction,
  onGeographyAction,
  onLinksAction,
}) {
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={iconButtonClass(Boolean(links.length))}
                onClick={() => onLinksAction?.()}
                disabled={disabled || !governanceId}
                aria-label="Manage links"
              >
                <Link2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Manage links</TooltipContent>
          </Tooltip>ct";
import { Link2, MapPin, PanelsTopLeft } from "lucide-react";
import { toast } from "sonner";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";
import LinkManager from "@/components/link/LinkManager";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GovernanceEditorResources({
  governanceId = null,
  entityName = "",
  address,
  lat = null,
  lng = null,
  onAddressChange,
  onLocationChange,
  links = [],
  onLinksChange,
  onFiles,
  geographyId = null,
  onGeographySaved,
  disabled = false,
  onAddressAction,
  onGeographyAction,
  onLinksAction,
}) {

