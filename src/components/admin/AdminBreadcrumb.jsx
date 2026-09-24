import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AdminBreadcrumb({ items = [] }) {
  const visibleItems = items.filter((item) => item?.label);

  return (
    <nav aria-label="Administration breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link
        href="/admin"
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        Administration
      </Link>

      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`truncate ${isLast ? "font-semibold" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
