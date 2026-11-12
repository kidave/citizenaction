import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ClassificationBreadcrumb({ system, dimension }) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink href="/standards">
            <span className="sm:inline">Standards</span>
            <span className="sm:hidden">Std.</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {system && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem className="min-w-0">
              <BreadcrumbLink className="max-w-[120px] truncate sm:max-w-none">
                {system.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {dimension && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem className="min-w-0">
              <BreadcrumbLink className="max-w-[120px] truncate sm:max-w-none">
                {dimension.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
