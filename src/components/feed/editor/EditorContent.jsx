"use client";

import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { getEditorTypeConfig } from "./editorTypes";

import { loadEditorTools } from "@/components/editor/editorTools";

/* =========================================================
   HELPERS
   ========================================================= */

function stripHtml(value = "") {
  if (!value) return "";

  if (typeof window === "undefined") {
    return value.replace(/<[^>]*>/g, "");
  }

  const div = document.createElement("div");

  div.innerHTML = value;

  return div.textContent || div.innerText || "";
}

/* =========================================================
   LIST → TEXT
   ========================================================= */

function extractListText(data = {}) {
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

function blocksToPlainText(blocks = []) {
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

/* =========================================================
   INITIAL BLOCKS
   ========================================================= */

function getInitialBlocks({ content, contentJson }) {
  /*
   * Existing Editor.js document.
   */
  if (contentJson?.blocks?.length) {
    return contentJson.blocks;
  }

  /*
   * Existing plain text being opened
   * in an Editor.js type.
   */
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

/* =========================================================
   COMPONENT
   ========================================================= */

export default function EditorContent({
  type = "action",

  title,
  setTitle,

  content,
  setContent,

  contentJson,
  setContentJson,

  setContentFormat,

  /*
   * Existing attachment system.
   */
  attachments,
  addAttachments,

  onFocus,
}) {
  const editorConfig = getEditorTypeConfig(type);

  /*
   * Editor.js DOM holder.
   */
  const holderRef = useRef(null);

  /*
   * Editor.js instance.
   */
  const editorRef = useRef(null);

  /*
   * Keep latest state without
   * causing Editor.js to reinitialize.
   */
  const valuesRef = useRef({
    type,
    content,
    contentJson,
  });

  useEffect(() => {
    valuesRef.current = {
      type,
      content,
      contentJson,
    };
  }, [type, content, contentJson]);

  /* =======================================================
     PLAIN EDITOR
     ======================================================= */

  if (!editorConfig.rich) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <Input
          placeholder={`${editorConfig.label} title...`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-10 shrink-0 bg-muted"
          onFocus={onFocus}
        />

        <Textarea
          placeholder={editorConfig.placeholder}
          value={content || ""}
          onChange={(event) => {
            const value = event.target.value;

            setContent(value);

            setContentFormat("text");

            setContentJson(null);
          }}
          onFocus={onFocus}
          className="min-h-0 flex-1 resize-none bg-muted"
        />
      </div>
    );
  }

  /* =======================================================
     EDITOR.JS
     ======================================================= */

  return (
    <RichEditor
      key={type}
      type={type}
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      contentJson={contentJson}
      setContentJson={setContentJson}
      setContentFormat={setContentFormat}
      attachments={attachments}
      addAttachments={addAttachments}
      onFocus={onFocus}
      holderRef={holderRef}
      editorRef={editorRef}
      editorConfig={editorConfig}
      valuesRef={valuesRef}
    />
  );
}

/* =========================================================
   RICH EDITOR
   ========================================================= */

function RichEditor({
  title,
  setTitle,

  content,
  setContent,

  contentJson,
  setContentJson,

  setContentFormat,

  attachments,
  addAttachments,

  onFocus,

  holderRef,
  editorRef,

  editorConfig,
  valuesRef,
}) {
  /*
   * Keep the latest attachment function in a ref.
   *
   * useEditor creates addAttachments on every render,
   * so we must NOT use it directly as an effect dependency.
   */
  const addAttachmentsRef = useRef(addAttachments);

  useEffect(() => {
    addAttachmentsRef.current = addAttachments;
  }, [addAttachments]);

  useEffect(() => {
    /*
     * Capture the exact DOM node that this
     * effect initializes.
     *
     * This fixes the React ref cleanup warning.
     */
    const holderElement = holderRef.current;

    if (!holderElement) {
      return;
    }

    let cancelled = false;

    const initializeEditor = async () => {
      const { EditorJS, Header, Embed, Warning, List, ImageTool, Table } =
        await loadEditorTools();

      if (cancelled || !holderElement) {
        return;
      }

      const { content: initialContent, contentJson: initialContentJson } =
        valuesRef.current;

      const initialBlocks = getInitialBlocks({
        content: initialContent,
        contentJson: initialContentJson,
      });

      /*
       * Rich editor is always Editor.js.
       */
      setContentFormat("editorjs");

      const editor = new EditorJS({
        holder: holderElement,

        placeholder: editorConfig.placeholder,

        data: {
          time: initialContentJson?.time ?? Date.now(),

          blocks: initialBlocks,
        },

        tools: {
          /* =========================================
                 HEADER
              ========================================= */

          header: {
            class: Header,

            inlineToolbar: true,

            config: {
              levels: [1, 2, 3],

              defaultLevel: 2,
            },
          },

          /* =========================================
                 LIST
              ========================================= */

          list: {
            class: List,

            inlineToolbar: true,

            config: {
              defaultStyle: "unordered",

              maxLevel: 3,
            },
          },

          /* =========================================
                 TABLE
              ========================================= */

          table: {
            class: Table,

            inlineToolbar: true,

            config: {
              rows: 2,
              cols: 3,
            },
          },

          /* =========================================
                 IMAGE
              ========================================= */

          image: {
            class: ImageTool,

            config: {
              uploader: {
                uploadByFile: async (file) => {
                  const attachmentId = crypto.randomUUID();

                  const previewUrl = URL.createObjectURL(file);

                  /*
                   * IMPORTANT:
                   *
                   * Get the latest function
                   * without making it an effect
                   * dependency.
                   */
                  addAttachmentsRef.current({
                    attachmentId,

                    file,

                    file_name: file.name,

                    mime_type: file.type,

                    file_size: file.size,

                    public_url: previewUrl,

                    preview_url: previewUrl,

                    width: null,
                    height: null,

                    duration: null,

                    source: "editorjs",

                    editorjs: true,
                  });

                  return {
                    success: 1,

                    file: {
                      url: previewUrl,

                      attachmentId,
                    },
                  };
                },

                uploadByUrl: async () => {
                  throw new Error("Please upload an image from your device.");
                },
              },
            },
          },

          /* =========================================
                 EMBED
              ========================================= */

          embed: {
            class: Embed,

            inlineToolbar: true,

            config: {
              services: {
                youtube: true,
                vimeo: true,
              },
            },
          },

          /* =========================================
                 WARNING
              ========================================= */

          warning: {
            class: Warning,

            inlineToolbar: true,
          },
        },

        /* =========================================
               CHANGE
            ========================================= */

        async onChange(api) {
          const saved = await api.saver.save();

          const blocks = saved?.blocks || [];

          const plainText = blocksToPlainText(blocks);

          setContent(plainText);

          setContentFormat("editorjs");

          setContentJson({
            time: saved.time,

            blocks,

            version: saved.version,
          });
        },
      });

      /*
       * If the component was unmounted while
       * Editor.js was loading, immediately
       * destroy the instance instead of keeping
       * it alive.
       */
      if (cancelled) {
        editor.destroy();
        return;
      }

      editorRef.current = editor;
    };

    initializeEditor();

    return () => {
      cancelled = true;

      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
      }

      editorRef.current = null;

      /*
       * Clean the exact DOM node that
       * this effect initialized.
       */
      holderElement.innerHTML = "";
    };

    /*
     * INTENTIONAL:
     *
     * Editor.js must only initialize once
     * for this mounted RichEditor.
     *
     * The component has `key={type}`, so changing
     * Action/Report/Update remounts it.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Input
        placeholder={`${editorConfig.label} title...`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="h-10 shrink-0 bg-muted"
        onFocus={onFocus}
      />

      <div
        ref={holderRef}
        onFocus={onFocus}
        className="editorjs-container min-h-0 flex-1 overflow-y-auto rounded-md bg-muted px-4 py-3"
      />
    </div>
  );
}
