// components/layout/PageContainer.js
export default function PageContainer({
  children,
  maxWidth = "7xl",
  right,
}) {
  return (
    <div className={`max-w-${maxWidth} mx-auto px-4 py-6`}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        
        {/* MAIN CONTENT */}
        <div className="min-w-0">
          {children}
        </div>

        {/* RIGHT SIDEBAR */}
        {right && (
          <aside className="hidden xl:block">
            {right}
          </aside>
        )}

      </div>
    </div>
  );
}
