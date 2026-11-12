export default function SpaceTimelineEmpty({
  title = "Nothing here yet",
  description = "There are no activities to display.",
  action,
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
      <div className="rounded-[28px] border bg-card/70 p-8 text-center shadow-sm backdrop-blur">
        <div className="text-lg font-semibold">{title}</div>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        {action}
      </div>
    </section>
  );
}
