import { ChevronDown, ChevronRight } from "lucide-react";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";

export default function TreeNode({ node, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const hasChildren = node.children.length > 0;

  return (
    <div className="ml-4">
      <div
        className={`flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-muted ${
          selected?.id === node.id ? "bg-muted" : ""
        }`}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className="h-4 w-4"
            />
          ) : (
            <ChevronRight
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className="h-4 w-4"
            />
          )
        ) : (
          <div className="w-4" />
        )}

        <Badge variant="outline">{node.code}</Badge>

        <span>{node.title}</span>
      </div>

      {open &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}
