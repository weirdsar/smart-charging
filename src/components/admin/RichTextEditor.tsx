'use client';

import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const toolbarBtn =
  'flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-surface-light';
const toolbarBtnActive = 'bg-accent/10 text-accent';

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      ImageExtension,
      Placeholder.configure({
        placeholder: placeholder ?? 'Начните вводить текст...',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] text-text-primary text-sm leading-relaxed focus:outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('URL ссылки');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('URL изображения');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="overflow-hidden rounded-md border border-surface-light">
      <div className="flex flex-wrap gap-1 border-b border-surface-light bg-surface p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${toolbarBtn} ${editor.isActive('bold') ? toolbarBtnActive : ''}`}
          title="Жирный"
        >
          <Bold className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${toolbarBtn} ${editor.isActive('italic') ? toolbarBtnActive : ''}`}
          title="Курсив"
        >
          <Italic className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${toolbarBtn} min-w-[2rem] text-xs font-semibold ${editor.isActive('heading', { level: 2 }) ? toolbarBtnActive : ''}`}
          title="Заголовок 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${toolbarBtn} min-w-[2rem] text-xs font-semibold ${editor.isActive('heading', { level: 3 }) ? toolbarBtnActive : ''}`}
          title="Заголовок 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarBtn} ${editor.isActive('bulletList') ? toolbarBtnActive : ''}`}
          title="Маркированный список"
        >
          <List className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${toolbarBtn} ${editor.isActive('orderedList') ? toolbarBtnActive : ''}`}
          title="Нумерованный список"
        >
          <ListOrdered className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" onClick={addLink} className={toolbarBtn} title="Ссылка">
          <LinkIcon className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" onClick={addImage} className={toolbarBtn} title="Изображение">
          <ImageIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <EditorContent editor={editor} className="bg-surface p-4" />
    </div>
  );
}
