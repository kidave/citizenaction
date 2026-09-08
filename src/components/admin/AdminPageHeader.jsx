import BackButton from "@/components/ui/back-button";

export default function AdminPageHeader({ title }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
        <BackButton />

        <h1 className="min-w-0 flex-1 truncate font-semibold sm:text-lg">
          {title}
        </h1>
      </div>
    </header>
  );
}
