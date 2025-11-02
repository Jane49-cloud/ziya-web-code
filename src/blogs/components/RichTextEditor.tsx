import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  isActive?: boolean;
  ariaLabel: string;
}> = ({ onClick, icon, isActive = false, ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${isActive ? "bg-sky-100 text-sky-600" : ""}`}
  >
    {icon}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Craft a compelling narrative…",
  readOnly = false,
}) => {
  const handleChange = onChange ?? (() => {});
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: value,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] focus:outline-none text-slate-800 leading-relaxed",
      },
    },
    onUpdate({ editor: instance }) {
      const html = instance.getHTML();
      handleChange(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 text-center text-sm text-slate-400">
        Loading editor…
      </div>
    );
  }

  const promptForLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const promptForImage = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200/60 shadow-[0_26px_90px_-60px_rgba(15,23,42,0.5)] ${
        readOnly ? "bg-slate-100/90" : "bg-white/95"
      }`}
    >
      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200/50 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2 pr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              icon={<Bold size={16} />}
              isActive={editor.isActive("bold")}
              ariaLabel="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              icon={<Italic size={16} />}
              isActive={editor.isActive("italic")}
              ariaLabel="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              icon={<Heading2 size={16} />}
              isActive={editor.isActive("heading", { level: 2 })}
              ariaLabel="Heading"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              icon={<Strikethrough size={16} />}
              isActive={editor.isActive("strike")}
              ariaLabel="Strikethrough"
            />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200/60 pl-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              icon={<List size={16} />}
              isActive={editor.isActive("bulletList")}
              ariaLabel="Bullet list"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              icon={<ListOrdered size={16} />}
              isActive={editor.isActive("orderedList")}
              ariaLabel="Ordered list"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              icon={<Quote size={16} />}
              isActive={editor.isActive("blockquote")}
              ariaLabel="Quote"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              icon={<Minus size={16} />}
              ariaLabel="Divider"
            />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200/60 pl-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              icon={<AlignLeft size={16} />}
              isActive={editor.isActive({ textAlign: "left" })}
              ariaLabel="Align left"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              icon={<AlignCenter size={16} />}
              isActive={editor.isActive({ textAlign: "center" })}
              ariaLabel="Align center"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              icon={<AlignRight size={16} />}
              isActive={editor.isActive({ textAlign: "right" })}
              ariaLabel="Align right"
            />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200/60 pl-3">
            <ToolbarButton
              onClick={promptForLink}
              icon={<LinkIcon size={16} />}
              isActive={editor.isActive("link")}
              ariaLabel="Insert link"
            />
            <ToolbarButton
              onClick={promptForImage}
              icon={<ImageIcon size={16} />}
              ariaLabel="Insert image"
            />
          </div>
        </div>
      ) : null}

      <div className="relative bg-gradient-to-b from-slate-50/90 to-white/95 p-4 [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:rounded-xl [&_.ProseMirror]:border [&_.ProseMirror]:border-slate-200/80 [&_.ProseMirror]:bg-white [&_.ProseMirror]:p-5 [&_.ProseMirror]:text-slate-800 [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:shadow-inner [&_.ProseMirror:focus-visible]:outline-none [&_.ProseMirror:focus-visible]:ring-4 [&_.ProseMirror:focus-visible]:ring-sky-100 [&_.ProseMirror>p]:mb-4 [&_.ProseMirror>h2]:mt-8 [&_.ProseMirror>h2]:text-2xl [&_.ProseMirror>h2]:font-semibold [&_.ProseMirror>h3]:mt-6 [&_.ProseMirror>h3]:text-xl [&_.ProseMirror>ul]:list-disc [&_.ProseMirror>ul]:pl-6 [&_.ProseMirror>ol]:list-decimal [&_.ProseMirror>ol]:pl-6 [&_.ProseMirror>blockquote]:border-l-4 [&_.ProseMirror>blockquote]:border-sky-200 [&_.ProseMirror>blockquote]:bg-sky-50 [&_.ProseMirror>blockquote]:px-4 [&_.ProseMirror>blockquote]:py-3 [&_.ProseMirror>img]:mx-auto [&_.ProseMirror>img]:my-6 [&_.ProseMirror>img]:rounded-xl">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
