// components/shared/ui/EditorJsField.js
import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Editor.js to avoid SSR issues
const EditorJS = dynamic(() => import('@editorjs/editorjs'), {
  ssr: false,
});

const EDITOR_TOOLS = {
  header: {
    class: require('@editorjs/header'),
    config: {
      placeholder: 'Enter a header...',
      levels: [2, 3, 4],
      defaultLevel: 2
    }
  },
  list: {
    class: require('@editorjs/list'),
    inlineToolbar: true
  },
  table: {
    class: require('@editorjs/table'),
    inlineToolbar: true
  },
  quote: {
    class: require('@editorjs/quote'),
    inlineToolbar: true
  },
  delimiter: {
    class: require('@editorjs/delimiter')
  }
};

export default function EditorJsField({ value, onChange, placeholder = "Start writing..." }) {
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && EditorJS && !editorRef.current) {
      initializeEditor();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const initializeEditor = async () => {
    const editor = new EditorJS({
      holder: 'editorjs',
      tools: EDITOR_TOOLS,
      data: value || {},
      placeholder: placeholder,
      async onChange(api, event) {
        try {
          const content = await api.saver.save();
          onChange(content);
        } catch (error) {
          console.error('Error saving editor content:', error);
        }
      },
      onReady: () => {
        setIsReady(true);
      }
    });

    editorRef.current = editor;
  };

  return (
    <div className="editorjs-field">
      <div id="editorjs" style={{ 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '16px',
        minHeight: '200px'
      }} />
      {!isReady && <div>Loading editor...</div>}
    </div>
  );
}