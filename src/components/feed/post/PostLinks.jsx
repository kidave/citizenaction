"use client";

import LinkCard from "./LinkCard";

export default function PostLinks({ links = [] }) {
  if (!Array.isArray(links) || links.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <LinkCard
          key={link.id ?? `${link.url}-${link.sort_order}`}
          link={link}
        />
      ))}
    </div>
  );
}
