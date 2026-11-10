import Topbar from "@/components/layout/Topbar";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";

export default function GeographyPage() {
  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden">
      <Topbar
        items={[
          { label: "Home", href: "/" },
          { label: "Geography", href: "/geography" },
        ]}
        title="Geography · Map tile test"
        backHref="/"
        containerClassName="max-w-none"
      />

      <main className="min-h-0 flex-1 overflow-hidden">
        <AddGeographyDialog
          embedded
          mapRenderer="tiles"
          open
          onOpenChange={() => {}}
          selectionOnly
          title="Geography"
        />
      </main>
    </div>
  );
}

GeographyPage.getLayout = (page) => page;
