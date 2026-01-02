import React from "react";
import { Button, Divider, Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UndoOutlined,
  RedoOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import type { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  // Helper so clicking toolbar buttons doesn't steal focus
  const run = (command: () => void) => (event: React.MouseEvent) => {
    event.preventDefault();
    command();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 flex flex-wrap gap-1">
      {/* Text Formatting */}
      <Tooltip title="Bold">
        <Button
          size="small"
          type={editor.isActive("bold") ? "primary" : "default"}
          icon={<BoldOutlined />}
          onMouseDown={run(() => editor.chain().focus().toggleBold().run())}
        />
      </Tooltip>

      <Tooltip title="Italic">
        <Button
          size="small"
          type={editor.isActive("italic") ? "primary" : "default"}
          icon={<ItalicOutlined />}
          onMouseDown={run(() => editor.chain().focus().toggleItalic().run())}
        />
      </Tooltip>

      <Tooltip title="Underline">
        <Button
          size="small"
          type={editor.isActive("underline") ? "primary" : "default"}
          icon={<UnderlineOutlined />}
          onMouseDown={run(() =>
            editor.chain().focus().toggleUnderline().run()
          )}
        />
      </Tooltip>

      <Tooltip title="Strike">
        <Button
          size="small"
          type={editor.isActive("strike") ? "primary" : "default"}
          icon={<StrikethroughOutlined />}
          onMouseDown={run(() => editor.chain().focus().toggleStrike().run())}
        />
      </Tooltip>

      <Divider type="vertical" className="h-7 mx-1" />

      {/* Headings */}
      <Tooltip title="Heading 1">
        <Button
          size="small"
          type={
            editor.isActive("heading", { level: 1 }) ? "primary" : "default"
          }
          onMouseDown={run(() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          )}
        >
          H1
        </Button>
      </Tooltip>

      <Tooltip title="Heading 2">
        <Button
          size="small"
          type={
            editor.isActive("heading", { level: 2 }) ? "primary" : "default"
          }
          onMouseDown={run(() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          )}
        >
          H2
        </Button>
      </Tooltip>

      <Tooltip title="Heading 3">
        <Button
          size="small"
          type={
            editor.isActive("heading", { level: 3 }) ? "primary" : "default"
          }
          onMouseDown={run(() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          )}
        >
          H3
        </Button>
      </Tooltip>

      <Divider type="vertical" className="h-7 mx-1" />

      {/* Lists */}
      <Tooltip title="Bullet List">
        <Button
          size="small"
          type={editor.isActive("bulletList") ? "primary" : "default"}
          icon={<UnorderedListOutlined />}
          onMouseDown={run(() =>
            editor.chain().focus().toggleBulletList().run()
          )}
        />
      </Tooltip>

      <Tooltip title="Numbered List">
        <Button
          size="small"
          type={editor.isActive("orderedList") ? "primary" : "default"}
          icon={<OrderedListOutlined />}
          onMouseDown={run(() =>
            editor.chain().focus().toggleOrderedList().run()
          )}
        />
      </Tooltip>

      <Divider type="vertical" className="h-7 mx-1" />

      {/* Alignment */}
      <Tooltip title="Align Left">
        <Button
          size="small"
          type={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
          icon={<AlignLeftOutlined />}
          onMouseDown={run(() =>
            editor.chain().focus().setTextAlign("left").run()
          )}
        />
      </Tooltip>

      <Tooltip title="Align Center">
        <Button
          size="small"
          type={
            editor.isActive({ textAlign: "center" }) ? "primary" : "default"
          }
          icon={<AlignCenterOutlined />}
          onMouseDown={run(() =>
            editor.chain().focus().setTextAlign("center").run()
          )}
        />
      </Tooltip>

      <Tooltip title="Align Right">
        <Button
          size="small"
          type={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}
          icon={<AlignRightOutlined />}
          onMouseDown={run(() =>
            editor.chain().focus().setTextAlign("right").run()
          )}
        />
      </Tooltip>

      <Divider type="vertical" className="h-7 mx-1" />

      {/* Link */}
      <Tooltip title="Add Link">
        <Button
          size="small"
          type={editor.isActive("link") ? "primary" : "default"}
          icon={<LinkOutlined />}
          onMouseDown={run(addLink)}
        />
      </Tooltip>

      <Divider type="vertical" className="h-7 mx-1" />

      {/* Undo/Redo */}
      <Tooltip title="Undo">
        <Button
          size="small"
          icon={<UndoOutlined />}
          onMouseDown={run(() => editor.chain().focus().undo().run())}
          disabled={!editor.can().undo()}
        />
      </Tooltip>

      <Tooltip title="Redo">
        <Button
          size="small"
          icon={<RedoOutlined />}
          onMouseDown={run(() => editor.chain().focus().redo().run())}
          disabled={!editor.can().redo()}
        />
      </Tooltip>
    </div>
  );
};
