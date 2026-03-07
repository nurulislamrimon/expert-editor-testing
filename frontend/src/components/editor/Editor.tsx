import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect, useRef } from 'react';
import { mediaApi } from '@/lib/media-api';

interface EditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
  editable?: boolean;
}

export function Editor({ content, onUpdate, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content: content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      try {
        const { fileUrl } = await mediaApi.getSignedUploadUrl({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        });

        const uploadUrlResponse = await mediaApi.getSignedUploadUrl({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        });

        await mediaApi.uploadToR2(uploadUrlResponse.uploadUrl, file);

        editor.chain().focus().setImage({ src: uploadUrlResponse.fileUrl }).run();
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    },
    [editor],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          await handleImageUpload(file);
        }
      }
    },
    [handleImageUpload],
  );

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              await handleImageUpload(file);
            }
            break;
          }
        }
      }
    },
    [handleImageUpload],
  );

  const handleFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          await handleImageUpload(file);
        }
      }
    },
    [handleImageUpload],
  );

  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className="editor-container border rounded-lg"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
    >
      {editable && (
        <div className="toolbar flex flex-wrap gap-2 p-2 border-b bg-gray-50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            Bullet List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('orderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            Ordered List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('codeBlock') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            Code Block
          </button>
          <button
            type="button"
            onClick={() => {
              const url = window.prompt('Enter URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`px-2 py-1 rounded ${
              editor.isActive('link') ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            Link
          </button>
          <label className="px-2 py-1 rounded cursor-pointer hover:bg-gray-200">
            Add Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>
      )}

      {editor && editable && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-black text-white rounded flex gap-1 p-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-gray-700 px-2 py-1 rounded' : 'px-2 py-1 rounded'}
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-gray-700 px-2 py-1 rounded' : 'px-2 py-1 rounded'}
            >
              I
            </button>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[300px]" />

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 300px;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
        }
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
