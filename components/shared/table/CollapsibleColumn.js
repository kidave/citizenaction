import { Table, TableHeader, TableCell } from '.';
import ResizableColumn from './ResizableColumn';

export default function CollapsibleColumn({
  columnKey,
  label,
  width,
  isCollapsed,
  onToggle,
  onResize
}) {
  return (
    <TableHeader width={isCollapsed ? 40 : width}>
      <div 
        className={styles["collapsible-header"]} 
        onClick={() => onToggle(columnKey)}
      >
        {label}
        {isCollapsed && <span className={styles["expand-icon"]}>+</span>}
      </div>
      {!isCollapsed && (
        <ResizableColumn 
          columnKey={columnKey}
          currentWidth={width}
          onResize={onResize}
        />
      )}
    </TableHeader>
  );
}