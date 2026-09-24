import Topbar from "@/components/layout/Topbar";

export default function StandardsTopbar({
  items = [],
  title,
  actions,
  primaryActions = [],
  overflowActions = [],
  bottom,
  backHref = "/standards",
  containerClassName,
}) {
  return (
    <Topbar
      items={items}
      title={title}
      actions={actions}
      primaryActions={primaryActions}
      overflowActions={overflowActions}
      bottom={bottom}
      backHref={backHref}
      containerClassName={containerClassName}
    />
  );
}
