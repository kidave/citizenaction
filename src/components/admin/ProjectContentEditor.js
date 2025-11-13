// components/admin/ProjectContentEditor.js
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import EditorJS with no SSR
const EditorJS = dynamic(() => import("@editorjs/editorjs"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

export default function ProjectContentEditor({ content, onChange, placeholder = "Start writing..." }) {
  const ejInstance = useRef(null);
  const [editorId] = useState(() => `editor-${Math.random().toString(36).substr(2, 9)}`);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ejInstance.current) return;

    const initEditor = async () => {
      try {
        // Wait for component to mount
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if holder exists
        if (!document.getElementById(editorId)) {
          console.error('Editor holder not found');
          return;
        }

        const Editor = (await import("@editorjs/editorjs")).default;
        const Header = (await import("@editorjs/header")).default;
        const List = (await import("@editorjs/list")).default;
        const Paragraph = (await import("@editorjs/paragraph")).default;
        const Quote = (await import("@editorjs/quote")).default;
        const Delimiter = (await import("@editorjs/delimiter")).default;
        const Table = (await import("@editorjs/table")).default;
        const Checklist = (await import("@editorjs/checklist")).default;

        const editor = new Editor({
          holder: editorId,
          data: content || { blocks: [] },
          tools: {
            header: {
              class: Header,
              config: {
                placeholder: 'Enter a header...',
                levels: [2, 3, 4],
                defaultLevel: 2
              }
            },
            list: {
              class: List,
              inlineToolbar: true
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
              config: {
                placeholder: placeholder
              }
            },
            quote: {
              class: Quote,
              inlineToolbar: true
            },
            delimiter: Delimiter,
            table: {
              class: Table,
              inlineToolbar: true
            },
            checklist: {
              class: Checklist,
              inlineToolbar: true
            }
          },
          onChange: async () => {
            try {
              const saved = await editor.save();
              onChange(saved);
            } catch (error) {
              console.error('Error saving editor content:', error);
            }
          },
          onReady: () => {
            setIsReady(true);
          },
          minHeight: 100, // Small height for compact editors
          autofocus: false,
        });

        ejInstance.current = editor;
      } catch (error) {
        console.error('Editor initialization failed:', error);
      }
    };

    initEditor();

    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [editorId, placeholder]); // Add placeholder to dependencies

  // Update editor content when content prop changes
  useEffect(() => {
    if (ejInstance.current && content) {
      ejInstance.current.render(content);
    }
  }, [content]);

  return (
    <div className="compact-editor-container">
      <div 
        id={editorId} 
        style={{ 
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '12px',
          minHeight: '120px',
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: 'white',
          fontSize: '14px'
        }} 
      />
      {!isReady && (
        <div style={{ 
          padding: '8px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '12px'
        }}>
          Loading editor...
        </div>
      )}
    </div>
  );
}