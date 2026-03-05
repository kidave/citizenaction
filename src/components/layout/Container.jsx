export function Container({
  children,
  className = "",
}) {
  return (
    <div className={`mx-auto w-full max-w-3xl px-4 ${className}`}>
      {children}
    </div>
  );
}