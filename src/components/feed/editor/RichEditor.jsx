"use client";

import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { loadEditorTools } from "@/components/editor/editorTools";
import {
  getInitialBlocks,
  editorBlocksToFeedText,
} from "@/components/editor/editorUtils";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Could not read image"));

    reader.readAsDataURL(file);
  });
}

export default function RichEditor({
  title,
  setTitle,
  content,
  setContent,
  contentJson,
  setContentJson,
  setContentFormat,
  addAttachments,
  onFocus,
}) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);

  const valuesRef = useRef({ content, contentJson });
  const addAttachmentsRef = useRef(addAttachments);

  useEffect(() => {
    valuesRef.current = { content, contentJson };
  }, [content, contentJson]);

  useEffect(() => {
    addAttachmentsRef.current = addAttachments;
  }, [addAttachments]);

  useEffect(() => {
    const holderElement = holderRef.current;
    if (!holderElement) return;

    let cancelled = false;

    async function initializeEditor() {
      const { EditorJS, Header, Embed, Warning, List, ImageTool, Table } =
        await loadEditorTools();

      if (cancelled) return;

      const { content: initialContent, contentJson: initialContentJson } =
        valuesRef.current;

      const initialBlocks = getInitialBlocks({
        content: initialContent,
        contentJson: initialContentJson,
      });

      setContentFormat("editorjs");

      const editor = new EditorJS({
        holder: holderElement,
        minHeight: 0,
        placeholder: "Write your post...",
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
                  const editorUrl = await fileToDataUrl(file);

                  if (cancelled) {
                    URL.revokeObjectURL(previewUrl);
                    return {
                      success: 0,
                      file: { url: "" },
                    };
                  }

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
                      url: editorUrl,
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
  }, [setContent, setContentFormat, setContentJson]);

  return (
    <div className="flex-none">
      <div className="p-2">
        <Input
          placeholder="Post title..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-10 bg-muted"
          onFocus={onFocus}
        />
      </div>

      <div
        ref={holderRef}
        onFocus={onFocus}
        className="editorjs-container h-fit min-h-[76px] max-h-[40vh] overflow-y-auto px-2 pb-2 sm:px-16 [&_.codex-editor]:!h-auto [&_.codex-editor]:!min-h-0 [&_.codex-editor__redactor]:!h-auto [&_.codex-editor__redactor]:!min-h-0 [&_.codex-editor__redactor]:!pb-0"
      />
    </div>
  );
}
