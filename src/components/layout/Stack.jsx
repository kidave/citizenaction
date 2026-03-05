export function Stack({
  children,
  className = "",
  gap = "gap-4",
}) {
  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {children}
    </div>
  );
}