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
    reader.onerror = () =>
      reject(reader.error || new Error("Could not read image"));

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
  documentMode = false,
  showTitle = false,
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

    // Editor.js toolbar controls compete with the mobile virtual keyboard.
    // If the user taps + or settings while the caret is active, first dismiss
    // the keyboard without cancelling the toolbar click itself.
    const handleToolbarPointerDown = (event) => {
      const toolbarButton = event.target.closest(
        ".ce-toolbar__plus, .ce-toolbar__settings-btn",
      );

      if (!toolbarButton) return;

      const activeElement = document.activeElement;
      const isEditorInput =
        activeElement?.isContentEditable ||
        activeElement?.closest?.(".ce-block__content");

      if (isEditorInput) {
        activeElement.blur();
      }
    };

    holderElement.addEventListener(
      "pointerdown",
      handleToolbarPointerDown,
      true,
    );

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
        placeholder: documentMode
          ? "Start writing your document..."
          : "Write your post...",
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
      holderElement.removeEventListener(
        "pointerdown",
        handleToolbarPointerDown,
        true,
      );
      holderElement.innerHTML = "";
    };
  }, [documentMode, setContent, setContentFormat, setContentJson]);

  return (
    <div className={`flex min-h-0 flex-col ${documentMode ? "h-full min-h-0 flex-1 overflow-hidden" : ""}`}>
      {showTitle && (
        <div className="mx-auto w-full max-w-3xl px-2 pt-3 sm:px-0 sm:pt-5">
          <Input
            placeholder="Document title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-9 border-none bg-transparent px-0 text-xl font-semibold leading-tight shadow-none focus-visible:ring-0 sm:h-12 sm:text-3xl"
            onFocus={onFocus}
          />
        </div>
      )}

      <div
        ref={holderRef}
        onFocus={onFocus}
        className={
          documentMode
            ? "editorjs-container min-h-0 flex-1 overflow-y-auto px-2 pb-8 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_.codex-editor]:!min-h-full [&_.codex-editor__redactor]:!min-h-0 [&_.codex-editor__redactor]:!pb-8 [&_.ce-block__content]:!max-w-3xl [&_.ce-toolbar__content]:!max-w-3xl [&_.ce-paragraph]:font-serif [&_.ce-paragraph]:text-lg [&_.ce-paragraph]:leading-7 [&_.ce-header]:font-serif [&_.ce-header]:font-semibold [&_.ce-header]:tracking-tight [&_.ce-header]:leading-snug [&_.ce-header]:text-xl [&_.ce-block]:mb-4 [&_.image-tool__caption]:font-serif [&_.image-tool__caption]:text-xs [&_.image-tool__caption]:leading-relaxed [&_.cdx-list]:font-serif [&_.cdx-list]:text-lg [&_.cdx-list]:leading-7 [&_.cdx-list__item]:!min-h-0 [&_.cdx-list__item]:!py-0 [&_.cdx-list__item]:!leading-7 [&_.cdx-list__item-content]:font-serif [&_.cdx-list__item-content]:text-lg [&_.cdx-list__item-content]:leading-7 [&_.tc-table]:font-serif [&_.tc-table]:text-lg [&_.tc-cell]:font-serif [&_.tc-cell]:text-lg [&_.tc-cell]:leading-7 [&_.cdx-warning]:font-serif [&_.cdx-warning]:text-lg [&_.cdx-warning]:leading-7"
            : "editorjs-container h-fit min-h-[76px] max-h-[60vh] overflow-y-auto px-2 pb-2 sm:px-4 [&_.codex-editor]:!h-auto [&_.codex-editor]:!min-h-0 [&_.codex-editor__redactor]:!h-auto [&_.codex-editor__redactor]:!min-h-0 [&_.codex-editor__redactor]:!pb-0"
        }
      />
    </div>
  );
}
