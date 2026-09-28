"use client";

export default function PostEditorLayout({ header, content, footer, className = "" }) {
  return (
    <div className={`flex h-full min-h-0 flex-col ${className}`}>
      {header}
      <div className="min-h-0 flex-1 overflow-hidden">{content}</div>
      <div className="shrink-0">{footer}</div>
    </div>
  );
}
