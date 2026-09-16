import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, ChevronRight, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ActionButton({ action, mobile = false }) {
  const Icon = action.icon;

  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className={mobile ? "sr-only" : "hidden sm:inline"}>
        {action.label}
      </span>
    </>
  );

  if (action.href) {
    return (
      <Button
        asChild
        type="button"
        variant={action.variant || "ghost"}
        size={mobile ? "icon" : "sm"}
        className={mobile ? "shrink-0" : "gap-2 px-2 sm:px-3"}
        aria-label={action.label}
        title={action.label}
      >
        <Link href={action.href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={action.variant || "ghost"}
      size={mobile ? "icon" : "sm"}
      className={mobile ? "shrink-0" : "gap-2 px-2 sm:px-3"}
      aria-label={action.label}
      title={action.label}
      disabled={action.disabled}
      onClick={action.onClick}
    >
      {content}
    </Button>
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
  className = "",
  containerClassName = "max-w-6xl",
}) {
  const router = useRouter();
  const visibleItems = items.filter((item) => item?.label);
  const currentLabel = title || visibleItems.at(-1)?.label || "";
  const allActions = [...primaryActions, ...overflowActions];
  const mobileVisibleActions =
    allActions.length <= 3 ? allActions : primaryActions.slice(0, 3);
  const mobileOverflowActions =
    allActions.length <= 3 ? [] : allActions.slice(mobileVisibleActions.length);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-background/95 backdrop-blur ${className}`}
    >
      <div
        className={`mx-auto flex min-h-14 w-full items-center gap-2 px-3 sm:min-h-16 sm:px-4 ${containerClassName}`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={`Go back from ${currentLabel || "this page"}`}
          title="Go back"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 flex-1 items-center gap-1 text-sm md:flex"
        >
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;

            return (
              <span
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}

                {isLast || !item.href ? (
                  <span
                    className={`truncate ${isLast ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        <span className="min-w-0 flex-1 truncate font-semibold md:hidden">
          {currentLabel}
        </span>

        {allActions.length ? (
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <div className="hidden items-center gap-0.5 sm:flex">
              {allActions.map((action, index) => (
                <ActionButton key={`${action.label}-${index}`} action={action} />
              ))}
            </div>

            <div className="flex items-center gap-0.5 sm:hidden">
              {mobileVisibleActions.map((action, index) => (
                <ActionButton
                  key={`${action.label}-${index}`}
                  action={action}
                  mobile
                />
              ))}

              {mobileOverflowActions.length ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label="More actions"
                      title="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    {mobileOverflowActions.map((action, index) => (
                      <OverflowAction
                        key={`${action.label}-${index}`}
                        action={action}
                      />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
        ) : actions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </div>

      {bottom ? <div>{bottom}</div> : null}
    </header>
  );
}
