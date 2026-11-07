import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function GovernanceDirectoryPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}) {
  if (pageCount <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  const goTo = (nextPage) => (event) => {
    event.preventDefault();
    if (nextPage >= 1 && nextPage <= pageCount) onPageChange(nextPage);
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
      <p className="w-full text-center text-xs text-muted-foreground sm:w-auto sm:text-left" aria-live="polite">
        Showing {firstItem}–{lastItem} of {total}
      </p>

      <Pagination className="mx-0 w-full min-w-0 sm:w-auto">
        {/* Compact, fixed-width controls on mobile; numbered pages remain on desktop. */}
        <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:hidden">
          <PaginationPrevious
            href="#"
            onClick={goTo(page - 1)}
            aria-disabled={page <= 1}
            className={`h-9 w-9 shrink-0 justify-center p-0 [&>span]:hidden ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          />
          <span className="min-w-0 flex-1 text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
            Page {page} of {pageCount}
          </span>
          <PaginationNext
            href="#"
            onClick={goTo(page + 1)}
            aria-disabled={page >= pageCount}
            className={`h-9 w-9 shrink-0 justify-center p-0 [&>span]:hidden ${page >= pageCount ? "pointer-events-none opacity-50" : ""}`}
          />
        </div>

        <PaginationContent className="hidden sm:flex">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={goTo(page - 1)}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {start > 1 && (
            <>
              <PaginationItem>
                <PaginationLink href="#" onClick={goTo(1)}>1</PaginationLink>
              </PaginationItem>
              {start > 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            </>
          )}

          {pages.map((number) => (
            <PaginationItem key={number}>
              <PaginationLink
                href="#"
                onClick={goTo(number)}
                isActive={number === page}
                aria-label={`Go to page ${number}`}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}

          {end < pageCount && (
            <>
              {end < pageCount - 1 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              <PaginationItem>
                <PaginationLink href="#" onClick={goTo(pageCount)}>{pageCount}</PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={goTo(page + 1)}
              aria-disabled={page >= pageCount}
              className={page >= pageCount ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
