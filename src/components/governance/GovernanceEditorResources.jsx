"use client";

import { Link2, MapPin, PanelsTopLeft } from "lucide-react";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GovernanceEditorResources({
  governanceId = null,
  address,
  links = [],
  onFiles,
  geographyId = null,
  disabled = false,
  onAddressAction,
  onGeographyAction,
  onLinksAction,
}) {
  const iconButtonClass = (active) =>
    `h-9 w-9 shrink-0 ${active ? "bg-muted text-foreground hover:bg-muted/80" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`;

  return (
    <TooltipProvider>
      <div className="flex min-w-0 items-center gap-0.5">
        <ImagePicker
          accept="image/*"
          onUpload={onFiles}
          disabled={disabled}
        />

        <DocumentPicker
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onUpload={onFiles}
          disabled={disabled}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={iconButtonClass(Boolean(address))}
              onClick={() => onAddressAction?.()}
              disabled={disabled || !governanceId}
              aria-label={address ? "Change office address" : "Add office address"}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            <p>{address || "Add office address"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={iconButtonClass(Boolean(geographyId))}
              onClick={() => onGeographyAction?.()}
              disabled={disabled || !governanceId}
              aria-label={geographyId ? "Change jurisdiction" : "Add jurisdiction"}
            >
              <PanelsTopLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {geographyId ? "Change jurisdiction" : "Add jurisdiction"}
          </TooltipContent>
        </Tooltip>

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
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
