"use client";

import LinkCard from "./LinkCard";

export default function PostLinks({ links = [] }) {
  if (!Array.isArray(links) || links.length === 0) {
    return null;
  }

  const count = Math.min(links.length, 3);

  return (
    <div
      className={[
        "grid gap-2",
        count === 1 && "grid-cols-1",
        count === 2 && "grid-cols-2",
        count === 3 && "grid-cols-2 md:grid-cols-3",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {links.map((link) => (
        <LinkCard
          key={link.id ?? `${link.url}-${link.sort_order}`}
          link={link}
        />
      ))}
    </div>
  );
}
