import BackButton from "@/components/ui/back-button";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export default function AdminPageHeader({ items = [] }) {
  return (
    <header className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur lg:top-0">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center gap-3 px-4 sm:min-h-16">
        <BackButton />

        <div className="min-w-0 flex-1">
          <AdminBreadcrumb items={items} />
        </div>
      </div>
    </header>
  );
}
