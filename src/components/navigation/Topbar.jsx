import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, Home, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ActionButton({ action }) {
  const Icon = action.icon;

  const button = (
    <Button
      asChild={!!action.href}
      type={action.href ? undefined : "button"}
      variant={action.variant || "ghost"}
      size="icon"
      className="shrink-0"
      aria-label={action.label}
      title={action.label}
      disabled={action.href ? undefined : action.disabled}
      onClick={action.href ? undefined : action.onClick}
    >
      {action.href ? (
        <Link href={action.href}>
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </Link>
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{action.label}</TooltipContent>
    </Tooltip>
  );
}

function OverflowAction({ action }) {
  const Icon = action.icon;

  if (action.href) {
    return (
      <DropdownMenuItem asChild disabled={action.disabled}>
        <Link href={action.href}>
          {Icon ? <Icon className="h-4 w-4" /> : null}
          {action.label}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem disabled={action.disabled} onSelect={action.onClick}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {action.label}
    </DropdownMenuItem>
  );
}

export default function Topbar({
  items = [],
  title,
  primaryActions = [],
  overflowActions = [],
  actions,
  bottom,
  backHref = "/",
  showHome = true,
  className = "",
  containerClassName = "max-w-6xl",
}) {
  const router = useRouter();
  const visibleItems = items.filter((item) => item?.label);
  const currentLabel = title || visibleItems.at(-1)?.label || "";
  const allActions = [...primaryActions, ...overflowActions];

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  }

  const backButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0"
      aria-label={`Go back from ${currentLabel || "this page"}`}
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );

  const homeItem = visibleItems.find((item) => item.href === "/");

  return (
    <TooltipProvider delayDuration={250}>
      <header
        className={`sticky top-0 z-40 bg-background/95 backdrop-blur ${className}`}
      >
        <div
          className={`mx-auto flex min-h-14 w-full items-center gap-1.5 px-3 sm:min-h-16 sm:px-4 ${containerClassName}`}
        >
          {showHome && homeItem ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                  <Link href={homeItem.href} aria-label="Home">
                    <Home className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Home</TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>{backButton}</TooltipTrigger>
            <TooltipContent>Back</TooltipContent>
          </Tooltip>

          <div className="min-w-0 flex-1 truncate font-semibold">
            {currentLabel}
          </div>

          {allActions.length ? (
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              {allActions.slice(0, 3).map((action, index) => (
                <ActionButton key={`${action.label}-${index}`} action={action} />
              ))}

              {allActions.length > 3 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {allActions.slice(3).map((action, index) => (
                      <OverflowAction
                        key={`${action.label}-${index}`}
                        action={action}
                      />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          ) : actions ? (
            <div className="flex shrink-0 items-center gap-1">{actions}</div>
          ) : null}
        </div>

        {bottom ? <div>{bottom}</div> : null}
      </header>
    </TooltipProvider>
  );
}
