// components/standards/TreeNode.jsx

import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TreeNode({ node, selected, onInspect }) {
  const [open, setOpen] = useState(false);

  const hasChildren = node.children?.length > 0;
  const isSelected = selected?.id === node.id;

  const handleRowClick = () => {
    if (hasChildren) {
      setOpen((value) => !value);
    }
  };

  const handleInspect = (e) => {
    e.stopPropagation();
    onInspect?.(node);
  };

  return (
    <div className="ml-4">
      <div
        className={`group flex min-w-0 cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted ${
          isSelected ? "bg-muted" : ""
        }`}
        onClick={handleRowClick}
      >
        {/* EXPAND / COLLAPSE */}
        {hasChildren ? (
          open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <div className="h-4 w-4 shrink-0" />
        )}

        {/* INSPECT */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInspect}
          className="h-8 shrink-0 gap-1 px-2 text-xs opacity-70 hover:opacity-100"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>

        {/* TITLE */}
        <span className="min-w-0 flex-1 truncate">{node.title}</span>
      </div>

      {/* CHILDREN */}
      {open &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            selected={selected}
            onInspect={onInspect}
          />
        ))}
    </div>
  );
}
