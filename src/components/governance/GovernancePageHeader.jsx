import Topbar from "@/components/navigation/Topbar";

export default function GovernancePageHeader({
  items = [],
  title,
  actions,
  primaryActions = [],
  overflowActions = [],
  bottom,
  backHref = "/governance?tab=organizations",
}) {
  return (
    <Topbar
      items={[{ label: "Home", href: "/" }, ...items]}
      title={title || items.at(-1)?.label || "Governance"}
      actions={actions}
      primaryActions={primaryActions}
      overflowActions={overflowActions}
      bottom={bottom}
      backHref={backHref}
    />
  );
}
