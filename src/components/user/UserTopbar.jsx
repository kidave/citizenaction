import Topbar from "@/components/layout/Topbar";

export default function UserTopbar({
  items = [],
  title,
  actions,
  primaryActions = [],
  overflowActions = [],
  bottom,
  backHref = "/",
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
    />
  );
}
