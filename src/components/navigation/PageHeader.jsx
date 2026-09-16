import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Standard page context header.
 *
 * Desktop: breadcrumb + optional actions
 * Mobile: back button + current page title
 * Optional bottom content stays inside the same sticky surface.
 */
export default function PageHeader({
  items = [],
  title,
  actions,
  bottom,
  className = "",
}) {
  const router = useRouter();
  const visibleItems = items.filter((item) => item?.label);
  const parentItems = visibleItems.slice(0, -1);
  const currentLabel = title || visibleItems.at(-1)?.label || "";

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    const fallback = parentItems.at(-1)?.href || "/";
    router.push(fallback);
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-background/95 backdrop-blur ${className}`}
    >
      <div className="mx-auto flex min-h-14 max-w-6xl items-center gap-2 px-3 sm:min-h-16 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mr-1 shrink-0 md:hidden"
            aria-label={`Go back from ${currentLabel || "this page"}`}
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-1 text-sm md:flex"
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

          <span className="min-w-0 truncate font-semibold md:hidden">
            {currentLabel}
          </span>
        </div>

        {actions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </div>

      {bottom ? <div>{bottom}</div> : null}
    </header>
  );
}
