"use client";

import { Check } from "lucide-react";

import EditorRichText from "./EditorRichText";

function ChecklistItem({ item }) {
  const content =
    typeof item === "string" ? item : item?.content || item?.text || "";
  const checked = Boolean(item?.meta?.checked ?? item?.checked);
  const children = typeof item === "object" ? item?.items || [] : [];

  return (
    <li className="list-none">
      <div className="flex items-start gap-2">
        <span
          className={[
            "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/50 bg-background",
          ].join(" ")}
          aria-hidden="true"
        >
          {checked && <Check className="h-3 w-3" strokeWidth={2.5} />}
        </span>

        <span className={checked ? "min-w-0 line-through opacity-60" : "min-w-0"}>
          <EditorRichText html={content} />
        </span>
      </div>

      {children.length > 0 && (
        <ul className="space-y-1 pl-6 pt-1">
          {children.map((child, index) => (
            <ChecklistItem key={index} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function EditorList({ items = [], style = "unordered" }) {
  if (style === "checklist") {
    return (
      <ul className="space-y-1 font-serif text-lg leading-7">
        {items.map((item, index) => (
          <ChecklistItem key={index} item={item} />
        ))}
      </ul>
    );
  }

  const ListTag = style === "ordered" ? "ol" : "ul";

  return (
    <ListTag
      className={
        style === "ordered"
          ? "list-decimal space-y-1 pl-6 font-serif text-lg leading-7"
          : "list-disc space-y-1 pl-6 font-serif text-lg leading-7"
      }
    >
      {items.map((item, index) => {
        const content =
          typeof item === "string" ? item : item?.content || item?.text || "";

        const children = typeof item === "object" ? item?.items || [] : [];

        return (
          <li key={index}>
            <EditorRichText html={content} />

            {children.length > 0 && (
              <EditorList items={children} style={style} />
            )}
          </li>
        );
      })}
    </ListTag>
  );
}
