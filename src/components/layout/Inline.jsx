export function Inline({ children, className = "", gap = "gap-2" }) {
  return (
    <div className={`flex flex-wrap items-center ${gap} ${className}`}>
      {children}
    </div>
  );
}
