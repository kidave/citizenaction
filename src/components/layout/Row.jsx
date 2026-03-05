export function Row({
  children,
  className = "",
  gap = "gap-2",
}) {
  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {children}
    </div>
  );
}