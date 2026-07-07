import { ScrollArea } from "@/components/ui/scroll-area";

import TreeNode from "./TreeNode";

export default function ClassificationTree({ tree = [], selected, onSelect }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
