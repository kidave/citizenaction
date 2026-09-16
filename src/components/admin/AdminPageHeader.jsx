import Topbar from "@/components/navigation/Topbar";

export default function AdminPageHeader({
  items = [],
  title,
  actions,
  primaryActions = [],
  overflowActions = [],
  bottom,
}) {
  return (
    <Topbar
      items={[{ label: "Administration", href: "/admin" }, ...items]}
      title={title || items.at(-1)?.label || "Administration"}
      actions={actions}
      primaryActions={primaryActions}
      overflowActions={overflowActions}
      bottom={bottom}
      backHref="/admin"
      showHome={false}
    />
  );
}
