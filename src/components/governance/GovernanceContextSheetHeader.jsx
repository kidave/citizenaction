import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SheetTitle } from "@/components/ui/sheet";
import { getGovernanceInitials, getGovernanceRoute } from "@/utils/governance";

export default function GovernanceContextSheetHeader({
  title,
  contextTitle,
  contextHref,
  organization,
}) {
  const organizationHref = getGovernanceRoute(organization);
  const organizationName = organization?.name || "Organization";
  const avatar = (
    <Avatar className="h-9 w-9 shrink-0 rounded-lg border">
      <AvatarImage src={organization?.image_url || undefined} alt="" />
      <AvatarFallback className="rounded-lg text-xs">
        {getGovernanceInitials(organizationName)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex min-w-0 items-center gap-2 pr-8 text-left">
      {organizationHref ? (
        <TooltipProvider delayDuration={250}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={organizationHref}
                aria-label={organizationName}
                title={organizationName}
                className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {avatar}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[min(20rem,80vw)]">
              {organizationName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span title={organizationName} aria-label={organizationName}>{avatar}</span>
      )}

      <div className="min-w-0 flex-1">
        <SheetTitle
          className="min-w-0 truncate text-left text-base sm:text-lg"
          title={contextTitle ? title + " " + contextTitle : title}
        >
          {title}
          {contextTitle && (
            <>
              {" "}
              {contextHref ? (
                <Link
                  href={contextHref}
                  title={contextTitle}
                  className="inline-block max-w-full truncate align-bottom underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {contextTitle}
                </Link>
              ) : (
                <span className="inline-block max-w-full truncate align-bottom" title={contextTitle}>
                  {contextTitle}
                </span>
              )}
            </>
          )}
        </SheetTitle>
        {contextTitle && (
          <div className="truncate text-xs font-normal text-muted-foreground" title={organizationName}>
            {organizationName}
          </div>
        )}
      </div>
    </div>
  );
}
