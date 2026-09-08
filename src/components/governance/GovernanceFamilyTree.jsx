import Link from "next/link";
import { ChevronRight, GitBranch } from "lucide-react";

import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";

function buildTree(records) {
  const nodes = new Map();
  const roots = [];

  (records || []).forEach((record) => {
    nodes.set(record.id, { ...record, children: [] });
  });

  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (items) => {
    items.sort((a, b) => getGovernanceLabel(a).localeCompare(getGovernanceLabel(b)));
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);
  return roots;
}

function TreeNode({ node, depth = 0 }) {
  const href = getGovernanceHref(node);
  const label = getGovernanceLabel(node);
  const isTextOnly = ["ministry", "department", "person"].includes(node.entity_type);

  return (
    <li className="relative">
      <div className="flex items-start gap-2">
        {depth > 0 ? <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}

        {isTextOnly ? (
          <Link href={href || "#"} className="min-w-0 text-sm hover:underline">
            <span className="font-medium">{label}</span>
            <span className="ml-2 text-xs text-muted-foreground">{node.entity_type}</span>
          </Link>
        ) : (
          <Link
            href={href || "#"}
            className="inline-flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <span className="font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">{node.entity_type}</span>
          </Link>
        )}
      </div>

      {node.children.length > 0 ? (
        <ul className="ml-5 mt-2 space-y-2 border-l pl-4">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function GovernanceFamilyTree({ records }) {
  const roots = buildTree(records);

  if (!roots.length) return null;

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">Governance structure</h2>
          <p className="text-xs text-muted-foreground">See how authorities, ministries, organisations and units relate to one another.</p>
        </div>
      </div>

      <ul className="space-y-3">
        {roots.map((root) => (
          <TreeNode key={root.id} node={root} />
        ))}
      </ul>
    </div>
  );
}
