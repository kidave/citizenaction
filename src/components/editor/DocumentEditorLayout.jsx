"use client";

export default function DocumentEditorLayout({ header, content, footer, className = "" }) {
  return (
    <div className={`flex h-full min-h-0 flex-col ${className}`}>
      {header}
      <main className="min-h-0 flex-1 overflow-hidden">{content}</main>
      <div className="shrink-0">{footer}</div>
    </div>
  );
}
