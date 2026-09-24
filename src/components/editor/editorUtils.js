export function stripHtml(value = "") {
  if (!value) return "";

  if (typeof window === "undefined") {
    return value.replace(/<[^>]*>/g, "");
  }

  const div = document.createElement("div");

  div.innerHTML = value;

  return div.textContent || div.innerText || "";
}

export function sanitizeHtml(value = "") {
  if (!value) return "";

  if (typeof window === "undefined") {
    return value;
  }

  const DOMPurify = require("dompurify");

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      "b",
      "strong",
      "i",
      "em",
      "u",
      "s",
      "a",
      "br",
      "mark",
      "code",
    ],

    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

/* =========================================================
   LIST → TEXT
   ========================================================= */

export function extractListText(data = {}) {
  const items = data?.items || [];

  function walk(listItems) {
    return listItems.flatMap((item) => {
      if (typeof item === "string") {
        return [stripHtml(item)];
      }

      const text = stripHtml(item?.content || item?.text || "");

      const children = item?.items || [];

      return [...(text ? [text] : []), ...walk(children)];
    });
  }

  return walk(items).filter(Boolean).join("\n");
}

/* =========================================================
   EDITOR.JS → PLAIN TEXT
   ========================================================= */

export function editorBlocksToFeedText(blocks = []) {
  return blocks
    .map((block) => {
      const data = block?.data || {};

      switch (block?.type) {
        case "paragraph":
          return stripHtml(data.text || "");

        case "header":
          return stripHtml(data.text || "");

        case "list":
          return extractListText(data);

        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export function getInitialBlocks({ content = "", contentJson = null }) {
  if (contentJson?.blocks?.length) {
    return contentJson.blocks;
  }

  if (content) {
    return [
      {
        type: "paragraph",
        data: {
          text: content,
        },
      },
    ];
  }

  return [];
}
