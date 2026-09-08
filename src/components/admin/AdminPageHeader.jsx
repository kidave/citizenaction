import BackButton from "@/components/ui/back-button";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export default function AdminPageHeader({ items = [] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
        <BackButton />

        <div className="min-w-0 flex-1">
          <AdminBreadcrumb items={items} />
        </div>
      </div>
    </header>
  );
}
