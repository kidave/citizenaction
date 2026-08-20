"use client";

import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";

import { loadEditorTools } from "@/components/editor/editorTools";

import {
  getInitialBlocks,
  editorBlocksToFeedText,
} from "@/components/editor/editorUtils";

export default function RichEditor({
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
  editorConfig,
}) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);

  const valuesRef = useRef({
    content,
    contentJson,
  });

  const addAttachmentsRef = useRef(addAttachments);

  useEffect(() => {
    valuesRef.current = {
      content,
      contentJson,
    };
  }, [content, contentJson]);

  useEffect(() => {
    addAttachmentsRef.current = addAttachments;
  }, [addAttachments]);

  useEffect(() => {
    const holderElement = holderRef.current;

    if (!holderElement) {
      return;
    }

    let cancelled = false;

    async function initializeEditor() {
      const { EditorJS, Header, Embed, Warning, List, ImageTool, Table } =
        await loadEditorTools();

      if (cancelled) {
        return;
      }

      const { content: initialContent, contentJson: initialContentJson } =
        valuesRef.current;

      const initialBlocks = getInitialBlocks({
        content: initialContent,
        contentJson: initialContentJson,
      });

      setContentFormat("editorjs");

      const editor = new EditorJS({
        holder: holderElement,

        placeholder: editorConfig.placeholder,

        data: {
          time: initialContentJson?.time ?? Date.now(),
          blocks: initialBlocks,
        },

        tools: {
          header: {
            class: Header,
            inlineToolbar: true,

            config: {
              levels: [1, 2, 3],
              defaultLevel: 2,
            },
          },

          list: {
            class: List,
            inlineToolbar: true,

            config: {
              defaultStyle: "unordered",
              maxLevel: 3,
            },
          },

          table: {
            class: Table,
            inlineToolbar: true,

            config: {
              rows: 2,
              cols: 3,
            },
          },

          image: {
            class: ImageTool,

            config: {
              uploader: {
                uploadByFile: async (file) => {
                  const attachmentId = crypto.randomUUID();
                  const previewUrl = URL.createObjectURL(file);

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

          warning: {
            class: Warning,
            inlineToolbar: true,
          },
        },

        async onChange(api) {
          const saved = await api.saver.save();

          const blocks = saved?.blocks || [];
          const feedText = editorBlocksToFeedText(blocks);

          setContent(feedText);
          setContentFormat("editorjs");

          setContentJson({
            time: saved.time,
            blocks,
            version: saved.version,
          });
        },
      });

      if (cancelled) {
        editor.destroy();
        return;
      }

      editorRef.current = editor;
    }

    initializeEditor();

    return () => {
      cancelled = true;

      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
      }

      editorRef.current = null;
      holderElement.innerHTML = "";
    };
  }, [editorConfig.placeholder, setContent, setContentFormat, setContentJson]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* TITLE */}

      <div className="p-2">
        <Input
          placeholder={`${editorConfig.label} title...`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-10 bg-muted"
          onFocus={onFocus}
        />
      </div>

      {/* RICH CONTENT */}

      <div
        ref={holderRef}
        onFocus={onFocus}
        className="editorjs-container flex-1 overflow-y-auto px-16"
      />
    </div>
  );
}
